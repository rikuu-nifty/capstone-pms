<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventorySchedulingUnit extends Model
{
    protected $fillable = [
        'inventory_scheduling_id',
        'unit_or_department_id',
    ];

    public function scheduling()
    {
        return $this->belongsTo(InventoryScheduling::class, 'inventory_scheduling_id');
    }

    public function unit()
    {
        return $this->belongsTo(UnitOrDepartment::class, 'unit_or_department_id');
    }
}
