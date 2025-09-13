<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventorySchedulingBuilding extends Model
{
    protected $fillable = [
        'inventory_scheduling_id',
        'building_id',
    ];

    public function scheduling()
    {
        return $this->belongsTo(InventoryScheduling::class, 'inventory_scheduling_id');
    }

    public function building()
    {
        return $this->belongsTo(Building::class, 'building_id');
    }
}
