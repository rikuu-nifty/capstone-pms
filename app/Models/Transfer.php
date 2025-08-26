<?php

namespace App\Models;

use App\Models\Concerns\HasFormApproval;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

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
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
        'scheduled_date' => 'date',
        'actual_transfer_date' => 'date',
    ];

    protected $appends = ['approved_by_name'];
    
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
        // return $this->hasMany(TransferAsset::class, 'transfer_id')->with('inventoryList);
        /* this will allow us to show each asset detail */
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

                return [
                    'id'          => optional($a)->id,
                    'asset_name'  => optional($a)->asset_name,
                    'serial_no'   => optional($a)->serial_no,
                    'asset_model' => [
                        'brand'    => optional($am)->brand,
                        'category' => [
                            'name' => optional(optional($am)->category)->name,
                        ],
                    ],
                ];
            })
            ->values()
            ->all();
    }
    
    public function getApprovedByNameAttribute(): ?string
    {
        $fa = $this->relationLoaded('formApproval')
            ? $this->getRelation('formApproval')
            : $this->formApproval()->with([
                'steps' => fn($q) => 
                    $q->where('code','approved_by')
                    ->where('status','approved')
                    ->orderByDesc('acted_at'),
                    'steps.actor:id,name',
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
}
