<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryScheduling extends Model
{
    protected $fillable = [
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

    // Inventory schedule belongs to a building
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
}
