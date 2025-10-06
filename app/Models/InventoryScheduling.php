<?php

namespace App\Models;

use App\Models\Concerns\HasFormApproval;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use Carbon\Carbon;

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
    public function syncScopeAndAssets(array $data): void
    {
        $scope = $data['scope_type']; // validated as 'unit' or 'building'

        // Normalize inputs and de-dupe
        $unitIds     = array_values(array_unique($data['unit_ids']      ?? []));
        $buildingIds = array_values(array_unique($data['building_ids']  ?? []));
        $roomIds     = array_values(array_unique($data['room_ids']      ?? []));
        $subAreaIds  = array_values(array_unique($data['sub_area_ids']  ?? []));

        // --- Sync pivots ---
        if ($scope === 'unit') {
            $this->units()->sync($unitIds);
            $this->buildings()->sync($buildingIds);
            $this->rooms()->sync($roomIds);
            $this->subAreas()->sync($subAreaIds);

            if (empty($roomIds)) {
                throw new \InvalidArgumentException("At least one room must be selected for unit scope.");
            }

            $assetIds = [];

            if (!empty($subAreaIds)) {
                // 🔹 Assets from selected subareas (but still filtered by unit)
                $assetIds = array_merge(
                    $assetIds,
                    InventoryList::whereIn('unit_or_department_id', $unitIds)
                        ->whereIn('sub_area_id', $subAreaIds)
                        ->pluck('id')
                        ->all()
                );
            }

            if (!empty($roomIds)) {
                // 🔹 Leftover assets for selected rooms (no subarea)
                $assetIds = array_merge(
                    $assetIds,
                    InventoryList::whereIn('unit_or_department_id', $unitIds)
                        ->whereIn('building_room_id', $roomIds)
                        ->whereNull('sub_area_id')
                        ->pluck('id')
                        ->all()
                );
            }

            if (!empty($buildingIds) && empty($roomIds) && empty($subAreaIds)) {
                // 🔹 If building(s) selected but no room/subarea
                $assetIds = array_merge(
                    $assetIds,
                    InventoryList::whereIn('unit_or_department_id', $unitIds)
                        ->whereIn('building_id', $buildingIds)
                        ->pluck('id')
                        ->all()
                );
            }

            if (empty($buildingIds) && empty($roomIds) && empty($subAreaIds)) {
                // 🔹 Fall back → all assets for the unit
                $assetIds = array_merge(
                    $assetIds,
                    InventoryList::whereIn('unit_or_department_id', $unitIds)
                        ->pluck('id')
                        ->all()
                );
            }

            // De-dupe
            $assetIds = array_values(array_unique($assetIds));

        } elseif ($scope === 'building') {
            $this->units()->sync([]);
            $this->buildings()->sync($buildingIds);
            $this->rooms()->sync($roomIds);
            $this->subAreas()->sync($subAreaIds);

            if (empty($roomIds)) {
                throw new \InvalidArgumentException("At least one room must be selected for building scope.");
            }

            $assetIds = [];

            $assetIds = array_merge(
                $assetIds,
                InventoryList::whereIn('building_room_id', $roomIds)
                    ->whereNull('sub_area_id')
                    ->pluck('id')
                    ->all()
            );

            // 🔹 Include assets from selected subareas
            if (!empty($subAreaIds)) {
                $assetIds = array_merge(
                    $assetIds,
                    InventoryList::whereIn('sub_area_id', $subAreaIds)
                        ->pluck('id')
                        ->all()
                );
            }

            // De-dupe
            $assetIds = array_values(array_unique($assetIds));
        } else {
            throw new \InvalidArgumentException("Invalid scope_type: {$scope}");
        }

        // Sync assets
        $current = $this->assets()->pluck('inventory_list_id')->all();

        $toDelete = array_diff($current,  $assetIds);
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

    public static function kpiStats(): array
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        $lastMonthStart = $now->copy()->subMonthNoOverflow()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonthNoOverflow()->endOfMonth();
        $quarterStart = $now->copy()->firstOfQuarter();
        $quarterEnd = $now->copy()->lastOfQuarter();

        // 1. On-Time Completion Rate (This Month)
        $completedThisMonth = static::where('scheduling_status', 'completed')
            ->whereBetween('actual_date_of_inventory', [$startOfMonth, $endOfMonth])
            ->count();

        $onTimeThisMonth = static::where('scheduling_status', 'completed')
            ->whereBetween('actual_date_of_inventory', [$startOfMonth, $endOfMonth])
            ->whereColumn('actual_date_of_inventory', '<=', 'inventory_schedule')
            ->count();

        $onTimeCompletionRate = $completedThisMonth > 0
            ? round(($onTimeThisMonth / $completedThisMonth) * 100, 1)
            : 0;

        // 2. Overdue From Last Month
        $overdueLastMonth = static::whereBetween('inventory_schedule', [$lastMonthStart, $lastMonthEnd])
            ->whereIn('scheduling_status', ['pending', 'pending_review', 'overdue'])
            ->count();

        // 3. Pending in Next 30 Days
        $pendingNext30Days = static::whereIn('scheduling_status', ['pending', 'pending_review'])
            ->whereBetween('inventory_schedule', [$now, $now->copy()->addDays(30)])
            ->count();

        // 4. Cancellation Rate (This Quarter)
        $totalQuarter = static::whereBetween('inventory_schedule', [$quarterStart, $quarterEnd])->count();
        $cancelledQuarter = static::where('scheduling_status', 'cancelled')
            ->whereBetween('inventory_schedule', [$quarterStart, $quarterEnd])
            ->count();

        $cancellationRate = $totalQuarter > 0
            ? round(($cancelledQuarter / $totalQuarter) * 100, 1)
            : 0;

        // 5. Average Delay (This Month)
        $delays = static::where('scheduling_status', 'completed')
            ->whereBetween('actual_date_of_inventory', [$startOfMonth, $endOfMonth])
            ->selectRaw('DATEDIFF(actual_date_of_inventory, inventory_schedule) as delay')
            ->pluck('delay');

        $avgDelay = $delays->count() > 0 ? round($delays->avg(), 1) : 0;

        return [
            'on_time_completion_rate' => $onTimeCompletionRate,
            'overdue_last_month'      => $overdueLastMonth,
            'pending_next_30_days'    => $pendingNext30Days,
            'cancellation_rate'       => $cancellationRate,
            'avg_delay_days'          => $avgDelay,
        ];
    }
}
