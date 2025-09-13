<?php

namespace App\Models;

use App\Models\Concerns\HasFormApproval;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class InventoryScheduling extends Model
{
    use HasFormApproval;

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

    public function units()
    {
        return $this->belongsToMany(UnitOrDepartment::class, 'inventory_scheduling_units')
            ->withTimestamps();
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

}
