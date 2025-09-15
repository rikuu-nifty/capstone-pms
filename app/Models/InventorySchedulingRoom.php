<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventorySchedulingRoom extends Model
{
    protected $fillable = [
        'inventory_scheduling_id',
        'building_room_id',
    ];

    public function scheduling()
    {
        return $this->belongsTo(InventoryScheduling::class, 'inventory_scheduling_id');
    }

    public function room()
    {
        return $this->belongsTo(BuildingRoom::class, 'building_room_id');
    }
}
