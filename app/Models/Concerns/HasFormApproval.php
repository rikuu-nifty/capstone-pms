<?php
// app/Models/Concerns/HasFormApproval.php
namespace App\Models\Concerns;

use App\Models\FormApproval;
use App\Enums\ApprovalStatus;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Support\Facades\Auth;

trait HasFormApproval
{
   protected static function bootHasFormApproval(): void
    {
        static::creating(function ($model) {
            $model->created_by_id ??= Auth::id();
        });

        static::created(function ($model) {
            if ($model->created_by_id) {
                $approval = $model->openApproval($model->created_by_id);

                // If you added the per-form step workflow, seed it now (safe check).
                if (method_exists($approval, 'seedDefaultSteps')) {
                    $approval->seedDefaultSteps();
                }
            }
        });
    }

    public function formApproval(): MorphOne
    {
        return $this->morphOne(FormApproval::class, 'approvable');
    }

    // Helper to (re)open an approval after create/update if desired
    public function openApproval(int $requestedById, ?string $title = null, ?string $type = null): FormApproval
    {
        return $this->formApproval()->create([
            'requested_by_id' => $requestedById,
            'form_type'       => $type  ?? $this->approvalFormType(),
            'form_title'      => $title ?? $this->approvalFormTitle(),
            'status'          => ApprovalStatus::PENDING_REVIEW->value,
            'requested_at'    => now(),
        ]);
    }

    public function approvalFormTitle(): string
    {
        return class_basename($this) . ' #' . $this->getKey();
    }

    public function approvalFormType(): string
    {
        return str(class_basename($this))->snake()->toString();
    }
}
