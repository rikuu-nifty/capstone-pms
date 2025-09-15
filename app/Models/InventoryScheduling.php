<?php

namespace App\Models;

use App\Models\Concerns\HasFormApproval;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InventoryScheduling extends Model
{
    use HasFormApproval, SoftDeletes;

    protected $fillable = [
        'prepared_by_id',
        'building_id',
        'building_room_id',
        'unit_or_department_id',
        'user_id',
        'designated_employee',
        'assigned_by',
        'inventory_schedule',
        'actual_date_of_inventory',
        'checked_by',
        'verified_by',
        'received_by',
        'scheduling_status',
        'description',
    ];

    public function approvals()
    {
        return $this->morphMany(FormApproval::class, 'approvable')->with('steps');
    }

    public function preparedBy()
    {
        return $this->belongsTo(User::class, 'prepared_by_id');
    }

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    // Inventory schedule belongs to a building room
    public function buildingRoom()
    {
        return $this->belongsTo(BuildingRoom::class);
    }

    // Inventory schedule belongs to a unit or department
    public function unitOrDepartment()
    {
        return $this->belongsTo(UnitOrDepartment::class);
    }

    public function units()
    {
        return $this->belongsToMany(UnitOrDepartment::class, 'inventory_scheduling_units')->withTimestamps();
    }

    public function buildings()
    {
        return $this->belongsToMany(Building::class, 'inventory_scheduling_buildings')
            ->withTimestamps();
    }

    public function rooms()
    {
        return $this->belongsToMany(BuildingRoom::class, 'inventory_scheduling_rooms')
            ->withTimestamps();
    }

    public function subAreas()
    {
        return $this->belongsToMany(SubArea::class, 'inventory_scheduling_sub_areas')
            ->withTimestamps();
    }

    public function assets()
    {
        return $this->hasMany(InventorySchedulingAsset::class, 'inventory_scheduling_id');
    }

    // User who created or owns the schedule
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Designated employee (assigned to perform the inventory)
    public function designatedEmployee()
    {
        return $this->belongsTo(User::class, 'designated_employee');
    }

    // User who assigned the task
    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function approvalFormTitle(): string
    {
        return 'Inventory Scheduling -  #' . $this->id;
    }

    // protected static function booted(): void
    // {
    //     static::creating(function (InventoryScheduling $m) {
    //         $m->created_by_id ??= Auth::id(); 
    //     });

    //     static::created(function (InventoryScheduling $m) {
    //         if ($m->created_by_id) {
    //             $m->openApproval($m->created_by_id);
    //         }
    //     });
    // }

    public function scopeWithViewRelations($q)
    {
        return $q->with([
            'building',
            'buildingRoom',
            'unitOrDepartment',
            'user',
            'designatedEmployee',
            'assignedBy',
        ]);
    }

    public static function findForView(int $id): self
    {
        return static::query()->withViewRelations()->findOrFail($id);
    }

    /**
     * Sync scope (units OR buildings/rooms/subareas) and auto-attach assets.
     */
    // public function syncScopeAndAssets(array $data): void
    // {
    //     $scope = $data['scope_type']; // validated as 'unit' or 'building'

    //     // Normalize inputs and de-dupe
    //     $unitIds     = array_values(array_unique($data['unit_ids']      ?? []));
    //     $buildingIds = array_values(array_unique($data['building_ids']  ?? []));
    //     $roomIds     = array_values(array_unique($data['room_ids']      ?? []));
    //     $subAreaIds  = array_values(array_unique($data['sub_area_ids']  ?? []));

    //     // --- Sync pivots ---
    //     if ($scope === 'unit') {
    //         $this->units()->sync($unitIds);
    //         $this->buildings()->sync($buildingIds);
    //         $this->rooms()->sync($roomIds);
    //         $this->subAreas()->sync($subAreaIds);

    //         // Fetch assets by units
    //         $assetIds = empty($unitIds) ? [] : InventoryList::whereIn('unit_or_department_id', $unitIds)
    //             ->pluck('id')
    //             ->all()
    //         ;

    //     } elseif ($scope === 'building') {
    //         $this->units()->sync([]);
    //         $this->buildings()->sync($buildingIds);
    //         $this->rooms()->sync($roomIds);
    //         $this->subAreas()->sync($subAreaIds);

    //         if (empty($buildingIds) && empty($roomIds) && empty($subAreaIds)) {
    //             $assetIds = [];
    //         } else {
    //             $assetIds = InventoryList::query()
    //                 ->when(!empty($subAreaIds), function ($q) use ($subAreaIds) {
    //                     // explicit subareas
    //                     $q->whereIn('sub_area_id', $subAreaIds);
    //                 })
    //                 ->when(!empty($roomIds), function ($q) use ($roomIds) {
    //                     // leftovers only
    //                     $q->orWhere(function ($x) use ($roomIds) {
    //                         $x->whereIn('building_room_id', $roomIds)
    //                             ->whereNull('sub_area_id');
    //                     });
    //                 })
    //                 ->when(!empty($buildingIds), function ($q) use ($buildingIds) {
    //                     // full buildings (only if rooms/subareas not chosen)
    //                     $q->orWhereIn('building_id', $buildingIds);
    //                 })
    //                 ->pluck('id')
    //                 ->all();
    //         }
    //     } else {
    //         throw new \InvalidArgumentException("Invalid scope_type: {$scope}");
    //     }

    //     // Sync assets
    //     $current = $this->assets()->pluck('inventory_list_id')->all();

    //     $toDelete = array_diff($current,  $assetIds);
    //     $toInsert = array_diff($assetIds, $current);

    //     if (!empty($toDelete)) {
    //         $this->assets()->whereIn('inventory_list_id', $toDelete)->delete();
    //     }

    //     if (!empty($toInsert)) {
    //         foreach ($toInsert as $assetId) {
    //             $this->assets()->firstOrCreate(
    //                 ['inventory_list_id' => $assetId],
    //                 ['inventory_status' => 'scheduled']
    //             );
    //         }
    //     }
    // }

    public function syncScopeAndAssets(array $data): void
    {
        $scope = $data['scope_type']; // validated as 'unit' or 'building'

        $unitIds     = array_values(array_unique($data['unit_ids']      ?? []));
        $buildingIds = array_values(array_unique($data['building_ids']  ?? []));
        $roomIds     = array_values(array_unique($data['room_ids']      ?? []));
        $subAreaIds  = array_values(array_unique($data['sub_area_ids']  ?? []));

        if ($scope === 'unit') {
            $this->units()->sync($unitIds);
            $this->buildings()->sync($buildingIds);
            $this->rooms()->sync($roomIds);
            $this->subAreas()->sync($subAreaIds);

            $assetIds = empty($unitIds)
                ? []
                : InventoryList::whereIn('unit_or_department_id', $unitIds)->pluck('id')->all();
        } elseif ($scope === 'building') {
            $this->units()->sync([]);
            $this->buildings()->sync($buildingIds);
            $this->rooms()->sync($roomIds);
            $this->subAreas()->sync($subAreaIds);

            if (!empty($subAreaIds)) {
                $assetIds = InventoryList::whereIn('sub_area_id', $subAreaIds)
                    ->pluck('id')->all();
            } elseif (!empty($roomIds)) {
                $assetIds = InventoryList::whereIn('building_room_id', $roomIds)
                    ->whereNull('sub_area_id')
                    ->pluck('id')->all();
            } elseif (!empty($buildingIds)) {
                $assetIds = InventoryList::whereIn('building_id', $buildingIds)
                    ->pluck('id')->all();
            } else {
                $assetIds = [];
            }
        } else {
            throw new \InvalidArgumentException("Invalid scope_type: {$scope}");
        }

        // Sync assets
        $current = $this->assets()->pluck('inventory_list_id')->all();

        $toDelete = array_diff($current, $assetIds);
        $toInsert = array_diff($assetIds, $current);

        if (!empty($toDelete)) {
            $this->assets()->whereIn('inventory_list_id', $toDelete)->delete();
        }

        if (!empty($toInsert)) {
            foreach ($toInsert as $assetId) {
                $this->assets()->firstOrCreate(
                    ['inventory_list_id' => $assetId],
                    ['inventory_status' => 'scheduled']
                );
            }
        }
    }
}
