<?php

namespace App\Models;

use App\Models\Concerns\HasFormApproval;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class Transfer extends Model
{
    use SoftDeletes;
    use HasFormApproval;

    protected $fillable = [
        'current_building_id',
        'current_building_room',
        'current_organization',
        'receiving_building_id',
        'receiving_building_room',
        'receiving_organization',
        'designated_employee',
        'assigned_by',
        'scheduled_date',
        'actual_transfer_date',
        'received_by',
        'status',
        'remarks',
        // ✅ ensure official signatory fields can be mass assigned if needed
        'approved_by_name',
        'approved_by_role',
        'approved_by_user_id',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
        'scheduled_date' => 'date:Y-m-d',
        'actual_transfer_date' => 'date:Y-m-d',
    ];

    protected $appends = [
        'approved_by_name', 
        'approved_by_role'
    ];
    
    public function currentBuildingRoom()
    {
        return $this->belongsTo(BuildingRoom::class, 'current_building_room');
    }

    public function currentOrganization()
    {
        return $this->belongsTo(UnitOrDepartment::class, 'current_organization');
    }

    public function receivingBuildingRoom()
    {
        return $this->belongsTo(BuildingRoom::class, 'receiving_building_room');
    }

    public function receivingOrganization()
    {
        return $this->belongsTo(UnitOrDepartment::class, 'receiving_organization');
    }

    public function designatedEmployee()
    {
        return $this->belongsTo(User::class, 'designated_employee');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function transferAssets()
    {
        return $this->hasMany(TransferAsset::class, 'transfer_id');
    }

    public function scopeWithViewRelations($query)
    {
        return $query->with([
            'currentBuildingRoom.building',
            'receivingBuildingRoom.building',
            'currentOrganization',
            'receivingOrganization',
            'designatedEmployee',
            'assignedBy',
            'transferAssets.asset.assetModel.category',
        ]);
    }

    public static function findForView(int $id): self
    {
        return static::query()->withViewRelations()->findOrFail($id);
    }

    public function viewingAssets(): array
    {
        $this->loadMissing('transferAssets.asset.assetModel.category');

        return $this->transferAssets
            ->map(function ($ta) {
                $a  = $ta->asset;
                $am = optional($a)->assetModel;
                $ec = optional($am)->equipmentCode;

                return [
                    'id'          => optional($a)->id,
                    'asset_name'  => optional($a)->asset_name,
                    'serial_no'   => optional($a)->serial_no,
                    'asset_model' => [
                        'brand'    => optional($am)->brand,
                        'category' => [
                            'name' => optional(optional($am)->category)->name,
                        ],
                        'equipment_code' => [
                            'code'        => optional($ec)->code,
                            'description' => optional($ec)->description,
                        ],
                    ],
                ];
            })
            ->values()
            ->all();
    }
    
    public function getApprovedByNameAttribute(): ?string
    {
        // ✅ Prefer official signatory record first
        $signatory = \App\Models\TransferSignatory::where('role_key', 'approved_by')->first();
        if ($signatory) {
            return $signatory->name;
        }

        // fallback to formApproval system
        $fa = $this->relationLoaded('formApproval')
            ? $this->getRelation('formApproval')
            : $this->formApproval()->with([
                'steps' => fn($q) => 
                    $q->where('code','approved_by')
                    ->where('status','approved')
                    ->orderByDesc('acted_at'),
                    'steps.actor:id,name',
                    'steps.actor.role:id,name',
            ])->first();

        $step = $fa?->steps->first();
        return $step
            ? ($step->is_external ? ($step->external_name ?: null) : ($step->actor->name ?? null))
            : null;
    }

    public function getCheckedByNameAttribute(): ?string
    {
        return $this->approved_by_name;
    }
    
    public function approvalFormTitle(): string
    {
        return 'Transfer -  #' . $this->id;
    }

    public function getApprovedByRoleAttribute(): ?string
    {
        // ✅ Prefer official signatory record first
        $signatory = \App\Models\TransferSignatory::where('role_key', 'approved_by')->first();
        if ($signatory) {
            return $signatory->title;
        }

        // fallback to formApproval system
        $fa = $this->relationLoaded('formApproval')
            ? $this->getRelation('formApproval')
            : $this->formApproval()->with([
                'steps' => fn($q) =>
                $q->where('code', 'approved_by')
                    ->where('status', 'approved')
                    ->orderByDesc('acted_at'),
                'steps.actor:id,name,role_id',
                'steps.actor.role:id,name',
            ])->first();

        $step = $fa?->steps->first();
        return $step && !$step->is_external
            ? ($step->actor->role->name ?? null)
            : null;
    }

    public static function kpiStats(): array
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth   = $now->copy()->endOfMonth();
        $lastMonthStart = $now->copy()->subMonthNoOverflow()->startOfMonth();
        $quarterStart = $now->copy()->firstOfQuarter();
        $quarterEnd   = $now->copy()->lastOfQuarter();

        // 1. Pending Review (This Month)
        $pendingReview = static::where('status', 'pending_review')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();

        // 2. Upcoming (Next 30 Days)
        $upcoming = static::where('status', 'upcoming')
            ->whereBetween('scheduled_date', [$now, $now->copy()->addDays(30)])
            ->count();

        // 4. Overdue (Last + Current Month)
        $overdue = static::whereIn('status', ['pending_review', 'upcoming', 'in_progress', 'overdue'])
            ->where('scheduled_date', '<', $now)
            ->where('scheduled_date', '>=', $lastMonthStart)
            ->count();

        // 5. Completion Rate (This Quarter)
        $totalQuarter = static::whereBetween('scheduled_date', [$quarterStart, $quarterEnd])->count();
        $completedQuarter = static::where('status', 'completed')
            ->whereBetween('scheduled_date', [$quarterStart, $quarterEnd])
            ->count();
        $completionRate = $totalQuarter > 0
            ? round(($completedQuarter / $totalQuarter) * 100, 1)
            : 0;

        // 7. Average Delay (This Month)
        $delays = static::where('status', 'completed')
            ->whereBetween('actual_transfer_date', [$startOfMonth, $endOfMonth])
            ->selectRaw('DATEDIFF(actual_transfer_date, scheduled_date) as delay')
            ->pluck('delay');
        $avgDelay = $delays->count() > 0 ? round($delays->avg(), 1) : 0;

        return [
            'pending_review'   => $pendingReview,
            'upcoming'         => $upcoming,
            'overdue'          => $overdue,
            'completion_rate'  => $completionRate,
            'avg_delay_days'   => $avgDelay,
        ];
    }
}
