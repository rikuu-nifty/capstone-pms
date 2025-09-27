<?php
namespace App\Models;

use App\Enums\ApprovalStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\FormApprovalSteps;

class FormApproval extends Model
{
    protected $fillable = [
        'requested_by_id',
        'reviewed_by_id',
        'form_type',
        'form_title',
        'status',
        'review_notes',
        'requested_at',
        'reviewed_at',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'reviewed_at'  => 'datetime',
    ];

    public function getCurrentStepAttribute()
{
    return $this->steps()
        ->where('status', 'pending')
        ->orderBy('step_order')
        ->first();
}

    protected function applyStepSideEffects(FormApprovalSteps $step): void
    {
        $model = $this->approvable; 
        if (!$model) return;

        if (method_exists($model, 'applyApprovalStepSideEffects')) {
            $step->loadMissing('actor');       // for internal approvers
            $model->applyApprovalStepSideEffects($step, $this);
            return;
        }

        if (property_exists($model, 'approvalStepToColumn')) {
            $map = $model->approvalStepToColumn;
            if (isset($map[$step->code]) && $step->status === 'approved') {
                $column = $map[$step->code];
                $step->loadMissing('actor');
                $value = $step->is_external 
                    ? ($step->external_name ?: null)
                    : ($step->actor?->name ?: null);
                if ($value) {
                    $model->forceFill([$column => $value])->save();
                }
            }
        }
    }

    public function approvable(): MorphTo   
    { 
        return $this->morphTo(); 
    }

    public function requestedBy(): BelongsTo
    { 
        return $this->belongsTo(User::class, 'requested_by_id'); 
    }

    public function reviewedBy(): BelongsTo 
    { 
        return $this->belongsTo(User::class, 'reviewed_by_id'); 
    }

    public function scopePending($q)  
    { 
        return $q->where('status', 
        ApprovalStatus::PENDING_REVIEW->value); 
    }
    
    public function scopeApproved($q) 
    { 
        return $q->where('status', ApprovalStatus::APPROVED->value); 
    }

    public function scopeRejected($q) 
    { 
        return $q->where('status', ApprovalStatus::REJECTED->value); 
    }

    public function scopeQuickSearch($q, ?string $s) {
        if (!$s) return $q;
        
        $s = trim($s);
        return $q->where(function($qq) use ($s) {
            $qq->where('form_title', 'like', "%{$s}%")
               ->orWhereDate('requested_at', $s)
               ->orWhereHas('requestedBy', fn($rq) => $rq->where('name','like',"%{$s}%"));
        });
    }

    public function steps(): HasMany
    {
        return $this->hasMany(FormApprovalSteps::class)->orderBy('step_order');
    }

    public function currentStep(): ?FormApprovalSteps
    {
        return $this->steps()->where('status','pending')->orderBy('step_order')->first();
    }

    /** Roll up child steps to overall status */
    public function recomputeOverallStatus(): void
    {
        $this->loadMissing('steps');

        if ($this->steps->firstWhere('status','rejected')) {
            $this->status = 'rejected';
        } elseif ($this->steps->every(fn($s) => $s->status === 'approved' || $s->status === 'skipped')) {
            $this->status = 'approved';
            $this->reviewed_by_id = $this->reviewed_by_id ?? Auth::id(); // optional
            $this->reviewed_at    = $this->reviewed_at ?? now();
        } else {
            $this->status = 'pending_review';
        }
        $this->save();
    }

    public function seedDefaultSteps(): void
    {
        $type = $this->form_type;

        $defs = match ($type) {
            'inventory_scheduling' => [
                ['prepared_by',   'Prepared By (PMO Staff)', false, true],
                ['noted_by',      'Noted By (PMO Head)',     false, false],
                ['approved_by',   'Approved By (VP Admin)',  false, false],
            ],

            // Off Campus: PMO Head issues -> Dean/Head (external signature)
            'off_campus' => [
                ['issued_by',             'Issued By (PMO Head)',             false, false],
                ['external_approved_by',  'Approved By (Dean/Head)',          true,  false],
            ],

            'transfer' => [
                ['prepared_by',  'Prepared By (PMO Staff)',       false, true],
                ['approved_by',  'Approved By (PMO Head)',        false, false],
            ],

            'turnover_disposal' => [
                ['prepared_by',  'Prepared By (PMO Staff)', false, true],
                ['external_noted_by', 'Noted By (Dean/Head)', true, false],
                ['noted_by',     'Noted By (PMO Head)',     false, false],
            ],

            default => [
                ['prepared_by', 'Prepared', false, true],
            ],
        };

        $order = 1;
        foreach ($defs as [$code,$label,$isExternal,$autoApprove]) {
            $step = $this->steps()->create([
                'step_order'               => $order++,
                'code'                     => $code,
                'label'                    => $label,
                'is_external'              => $isExternal,
                'auto_approve_by_creator'  => $autoApprove,
                'status'                   => $autoApprove ? 'approved' : 'pending',
                'actor_user_id'            => $autoApprove ? $this->requested_by_id : null,
                'acted_at'                 => $autoApprove ? now() : null,
            ]);
        }

        $this->recomputeOverallStatus();
    }

    //user-based
    public function approveCurrentStep(?string $notes = null): void
    {
        $step = $this->currentStep();
        if (!$step) return;

        if ($step->requiresExternalInput()) {
            // Guard: use externalApproveCurrentStep() for external signatures
            abort(422, 'This step requires external signer details.');
        }

        $step->update([
            'status'        => 'approved',
            'notes'         => $notes,
            'actor_user_id' => Auth::id(),
            'acted_at'      => now(),
        ]);

        $this->applyStepSideEffects($step);
        $this->recomputeOverallStatus();
    }

    /** Reject current step */
    public function rejectCurrentStep(?string $notes = null): void
    {
        $step = $this->currentStep();
        if (!$step) return;

        $step->update([
            'status'        => 'rejected',
            'notes'         => $notes,
            'actor_user_id' => Auth::id(),
            'acted_at'      => now(),
        ]);

        $this->recomputeOverallStatus();
    }

    /** Approve current step with external signer (Dean/Head) */
    public function externalApproveCurrentStep(string $name, ?string $title = null, ?string $notes = null): void
    {
        $step = $this->currentStep();
        if (!$step) return;
        
        if (!$step->requiresExternalInput()) {
            abort(422, 'This step does not accept external signatures.');
        }

        $step->update([
            'status'         => 'approved',
            'notes'          => $notes,
            'external_name'  => $name,
            'external_title' => $title,
            'acted_at'       => now(),
        ]);

        $this->applyStepSideEffects($step);
        $this->recomputeOverallStatus();
    }

    public function resetToPending(?int $toStepOrder = null): void
    {
        DB::transaction(function () use ($toStepOrder) {
            $this->loadMissing('steps', 'approvable');

            foreach ($this->steps as $step) {
                // keep creator auto-approved step as approved
                if ($step->auto_approve_by_creator) continue;

                // if $toStepOrder passed, only reset that step and those after it
                if ($toStepOrder !== null && $step->step_order < $toStepOrder) continue;

                $wasApproved = $step->status === 'approved';

                $step->update([
                    'status'         => 'pending',
                    'actor_user_id'  => null,
                    'external_name'  => null,
                    'external_title' => null,
                    'notes'          => null,
                    'acted_at'       => null,
                ]);

                if ($wasApproved && $this->approvable && property_exists($this->approvable, 'approvalStepToColumn')) {
                    $map = $this->approvable->approvalStepToColumn;
                    if (isset($map[$step->code])) {
                        $col = $map[$step->code];
                        $this->approvable->forceFill([$col => null]);
                        if ($this->approvable->isDirty($col)) {
                            $this->approvable->saveQuietly(); // avoid triggering events/booted hooks
                        }
                    }
                }
            }

            $this->fill([
                'status'         => 'pending_review',
                'reviewed_by_id' => null,
                'reviewed_at'    => null,
                'review_notes'   => null,
            ])->save();
        });

        $this->updateParentFormStatus('reset');
    }

    public function isFullyApproved(): bool
    {
        return $this->steps()->where('status', '!=', 'approved')->count() === 0;
    }

    public function updateParentFormStatus(?string $status = null): void
    {
        $model = $this->approvable;

        if (!$model) {
            return;
        }

        $handlers = [
            OffCampus::class => function ($model, $status, $approved) {
                if ($status === 'reset') {
                    $model->update(['status' => 'pending_review']);
                } elseif ($status === 'rejected') {
                    $model->update(['status' => 'cancelled']);
                } elseif ($approved) {
                    $model->update(['status' => 'pending_return']);
                }
            },
            
          InventoryScheduling::class => function ($model, $status, $approved) {
            if ($status === 'reset') {
                $model->update(['scheduling_status' => 'Pending_Review']);
            } elseif ($status === 'rejected') {
                $model->update(['scheduling_status' => 'Cancelled']);
            } elseif ($approved) {
                $model->update(['scheduling_status' => 'Pending']);
            }
        },
            Transfer::class => function ($model, $status, $approved) {
                if ($status === 'rejected') {
                    $model->update(['status' => 'cancelled']);
                } elseif ($status === 'reset') {
                    $model->update(['status' => 'pending_review']);
                } elseif ($approved) {
                    $model->update(['status' => 'upcoming']);
                }
            },
            
            TurnoverDisposal::class => function ($model, $status, $approved) {
                if ($status === 'rejected') {
                    $model->update(['status' => 'rejected']);
                } elseif ($status === 'reset') {
                    $model->update(['status' => 'pending_review']);
                } elseif ($approved) {
                    $model->update(['status' => 'approved']);
                }
            },
        ];

        $class = get_class($model);
        $approved = $this->isFullyApproved();

        if (isset($handlers[$class])) {
            $handlers[$class]($model, $status, $approved);
        }
    }
}
