<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;
use App\Notifications\MaintenanceDueNotification;
use Carbon\Carbon;

use App\Models\OffCampusAsset;

use Illuminate\Support\Facades\DB;

class InventoryList extends Model   
{
    use SoftDeletes;

    protected $casts = [
        'deleted_at' => 'datetime',
        'maintenance_due_date' => 'date',
    ];

    protected $appends = [
        'current_transfer_status',
        'current_inventory_status',
        'assigned_to_name',
        'current_turnover_disposal_status',
        'current_off_campus_status',
    ];

    protected $fillable = [
        'memorandum_no',
        'asset_model_id',
        'asset_name',
        'description',
        'unit_or_department_id',
        'building_id',
        'building_room_id',
        'sub_area_id',
        'category_id',
        'serial_no',
        'supplier',
        'unit_cost',
        'depreciation_value',
        'assigned_to',
        'date_purchased',
        'asset_type',
        'quantity',
        'deleted_by_id',
        'status',
        'image_path',
        'maintenance_due_date',
    ];

    public function assignedTo()
{
    return $this->belongsTo(Personnel::class, 'assigned_to');
}

    public function assetModel()
    {
        return $this->belongsTo(AssetModel::class, 'asset_model_id')->whereNull('asset_models.deleted_at');
    }

    public function unitOrDepartment()
    {
        return $this->belongsTo(UnitOrDepartment::class);
    }

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function roomBuilding()
    {
        return $this->hasOneThrough(
            Building::class,
            BuildingRoom::class,
            'id',
            'id',
            'building_room_id',
            'building_id',
        );
    }

    public function buildingRoom()
    {
        return $this->belongsTo(BuildingRoom::class, 'building_room_id');
    }

    public function subArea()
    {
        return $this->belongsTo(SubArea::class, 'sub_area_id');
    }

    public function turnoverDisposalAsset()
    {
        return $this->hasMany(TurnoverDisposalAsset::class, 'asset_id');
    }

    public function category() 
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function equipmentCode()
    {
        return $this->hasOneThrough(
            EquipmentCode::class,
            AssetModel::class,
            'id',                // PK on asset_models
            'id',                // PK on equipment_codes
            'asset_model_id',    // FK on inventory_lists → asset_models
            'equipment_code_id'  // FK on asset_models → equipment_codes
        );
    }

    public function assignmentItems()
    {
        return $this->hasMany(AssetAssignmentItem::class, 'asset_id');
    }

    public function personnel()
{
    return $this->belongsTo(Personnel::class, 'assigned_to');
}

public function assignments()
{
    return $this->hasMany(AssetAssignment::class, 'asset_id');
}

    public function getAssignedToNameAttribute(): ?string
    {
        $item = $this->latestAssignment; // call the relationship (will be eager loaded if controller uses with)

        return $item?->assignment?->personnel?->full_name;
    }

    public static function listForAssignments()
    {
        return static::query()
            ->with([
                'building:id,name',
                'buildingRoom:id,room,building_id',
                'subArea:id,name,building_room_id',
            ])
            ->select([
                'id',
                'serial_no',
                'asset_name',
                'building_id',
                'building_room_id',
                'sub_area_id',
                'unit_or_department_id',
            ])
            ->withExists(['assignmentItems as is_assigned'])
            ->get();
    }

    public function latestAssignment()
    {
        return $this->hasOne(AssetAssignmentItem::class, 'asset_id')->latestOfMany();
    }

    // public function previousAssignments()
    // {
    //     // All past assignments EXCLUDING the latest
    //     return $this->hasMany(AssetAssignment::class, 'asset_id')
    //         ->orderBy('date_assigned', 'desc')
    //         ->skip(1);
    // }

    public function offCampuses()
    {
        return $this->hasMany(OffCampus::class, 'asset_id');
    }

    public function offCampusAssets()
    {
        return $this->hasMany(OffCampusAsset::class, 'asset_id');
    }

    public function transfer()
    {
        return $this->belongsTo(Transfer::class, 'transfer_id');
    }

    public function resolveInventoryStatus()
    {
        // Pseudo logic: check inventory_schedulings + pivot, helper for NFC status
        return 'Not Yet Inventoried';
    }

    public function transferAssets()
    {
        return $this->hasMany(TransferAsset::class, 'asset_id');
    }

    public function getCurrentInventoryStatusAttribute(): ?string
    {
        return $this->schedulingAssets()
            ->latest('created_at')
            ->value('inventory_status');
    }

    public function getCurrentTransferStatusAttribute(): ?string
    {
        $transfer = $this->transfers()
            ->whereIn('transfers.status', [
                'pending_review',
                'upcoming',
                'in_progress',
                'overdue',
            ])
            ->latest('transfers.created_at')
            ->first();

        if ($transfer) {
            return $transfer->status;
        }

        // fallback to latest transfer (completed/cancelled)
        $latest = $this->transfers()
            ->latest('transfers.created_at')
            ->first();

        return $latest?->status;
    }

    public function getCurrentTurnoverDisposalStatusAttribute(): ?string
    {
        $latest = TurnoverDisposalAsset::with('turnoverDisposal')
            ->where('asset_id', $this->id)
            ->latest('created_at')
            ->first();

        if (!$latest || !$latest->turnoverDisposal) {
            return null;
        }

        $td = $latest->turnoverDisposal;

        if ($td->status === 'completed') {
            return $td->type === 'turnover'
                ? 'Turned Over'
                : ($td->type === 'disposal' ? 'Disposed' : 'Completed');
        }

        return ucfirst(str_replace('_', ' ', $td->status));
    }

    public function getCurrentOffCampusStatusAttribute(): ?string
    {
        $latest = OffCampusAsset::with('offCampus')
            ->where('asset_id', $this->id)
            ->latest('created_at')
            ->first();

        if (!$latest || !$latest->offCampus) {
            return null;
        }

        $oc = $latest->offCampus;

        // Combine status + remark
        $remark = $oc->remarks ? ucfirst(str_replace('_', ' ', $oc->remarks)) : null;

        if ($remark) {
            return ucfirst(str_replace('_', ' ', $oc->status)) . " ({$remark})";
        }

        return ucfirst(str_replace('_', ' ', $oc->status));
    }

    // DO NOT DELETE - FOR PIVOT TABLE and INVENTORY SHEET REPORTS
    public function transfers()
    {
        return $this->belongsToMany(
            Transfer::class, //related table
            'transfer_assets', //pivot table
            'asset_id', // FK on pivot pointing to Inventory Lists
            'transfer_id' // FK on pivot pointing to related table
        )
        ->withPivot([
            'id',
            'moved_at', //date transferred
            'from_sub_area_id',
            'to_sub_area_id',
            'asset_transfer_status',
            'remarks',
        ])
        ->withTimestamps();
    }

    public function schedulingAssets()
    {
        return $this->hasMany(InventorySchedulingAsset::class, 'inventory_list_id');
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by_id');
    }

    public static function kpis(?User $user = null): array
    {
        $query = static::query();

        if ($user && !$user->hasPermission('view-inventory-list')) {
            $query->where('unit_or_department_id', $user->unit_or_department_id);
        }

        $total    = (clone $query)->count();
        $active   = (clone $query)->where('status', 'active')->count();
        $archived = (clone $query)->where('status', 'archived')->count();
        $fixed    = (clone $query)->where('asset_type', 'fixed')->count();
        $notFixed = (clone $query)->where('asset_type', 'not_fixed')->count();
        $valueSum = (clone $query)->sum(DB::raw('quantity * unit_cost'));

        $statusDen = max($active + $archived, 0);
        $typeDen = max($fixed + $notFixed, 0);

        return [
            'total_assets' => $total,
            'total_inventory_sum' => $valueSum,
            'active_pct' => static::pct($active, $statusDen),
            'archived_pct' => static::pct($archived, $statusDen),
            'fixed_pct' => static::pct($fixed, $typeDen),
            'not_fixed_pct' => static::pct($notFixed, $typeDen),
        ];
    }

    protected static function pct(int|float $num, int|float $den): float
    {
        if ($den <= 0) return 0.0;
        return round(($num / $den) * 100, 1);
    }

    public static function sumInventoryValue(): float
    {
        $sum = 0.0;

        static::select(['id', 'quantity', 'unit_cost'])
            ->orderBy('id')
            ->chunkById(500, function ($rows) use (&$sum) {
                foreach ($rows as $row) {
                    $qty  = (int) ($row->quantity ?? 0);
                    $cost = (float) ($row->unit_cost ?? 0);
                    $sum += $qty * $cost;
                }
            });

        return $sum;
    }

    // public function offCampusAsset() // NEED LAGAY
    // {
    //     return $this->hasMany(offCampusAsset::class, 'asset_id');
    // }

    // Hook into model events for instant notifications
    protected static function booted()
    {
        // When a new asset is created
        static::created(function ($asset) {
            self::checkAndNotify($asset);
        });

        // When an existing asset is updated
        // static::updated(function ($asset) {
        //     if ($asset->isDirty('maintenance_due_date')) {
        //         self::checkAndNotify($asset);
        //     }
        // });

        static::updated(function ($asset) {
            if ($asset->maintenance_due_date && 
                Carbon::parse($asset->maintenance_due_date)->isToday() || 
                Carbon::parse($asset->maintenance_due_date)->isPast()
            ) {
                self::checkAndNotify($asset, true); // force notify
            }
        });
    }

    /**
     * Helper to check if due and send notifications
     */protected static function checkAndNotify($asset)
    {
        if ($asset->maintenance_due_date && (
            Carbon::parse($asset->maintenance_due_date)->isToday() ||
            Carbon::parse($asset->maintenance_due_date)->isPast()
        )) {
            $users = \App\Models\User::whereHas('role', function ($q) {
                $q->whereIn('code', ['pmo_staff', 'pmo_head']);
            })->get();

            foreach ($users as $user) {
                // Always send a new notification, even if same asset already had one
                $user->notify(new \App\Notifications\MaintenanceDueNotification($asset));
            }
        }
    }
}

// IF WANT MO KASAMA PATI VP ADMIN UNCOMMENT MOTO
//     protected static function checkAndNotify($asset)
// {
//     if ($asset->maintenance_due_date && (
//         \Carbon\Carbon::parse($asset->maintenance_due_date)->isToday() ||
//         \Carbon\Carbon::parse($asset->maintenance_due_date)->isPast()
//     )) {
//         $users = \App\Models\User::whereHas('role', function ($q) {
//             $q->whereIn('code', ['pmo_staff', 'pmo_head', 'vp_admin', 'superuser']);
//         })->get();

//         foreach ($users as $user) {
//             // Always send a new notification, even if same asset already had one
//             $user->notify(new \App\Notifications\MaintenanceDueNotification($asset));
//         }
//     }
// }

//     protected static function checkAndNotify($asset)
// {
//     if ($asset->maintenance_due_date && (
//         Carbon::parse($asset->maintenance_due_date)->isToday() ||
//         Carbon::parse($asset->maintenance_due_date)->isPast()
//     )) {
//         $users = User::whereHas('role', function ($q) {
//             $q->whereIn('code', ['pmo_staff', 'pmo_head', 'vp_admin', 'superuser']);
//         })->get();

//         foreach ($users as $user) {
//             // Avoid duplicate notifications for the same asset + user
//             $alreadySent = $user->notifications()
//                 ->where('type', \App\Notifications\MaintenanceDueNotification::class)
//                 ->where('data->asset_id', $asset->id)
//                 ->exists();

//             if (! $alreadySent) {
//                 $user->notify(new MaintenanceDueNotification($asset));
//             }
//         }
//     }
// }
