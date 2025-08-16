<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BuildingRoom extends Model
{
    protected $fillable = [
        'building_id',
        'room',
        'description',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function assets()
    {
        return $this->hasMany(InventoryList::class, 'building_room_id', 'id')
            ->whereNull('inventory_lists.deleted_at');
    }

     // Relationship: BuildingRooms has many inventory schedulings
    public function inventorySchedulings()
    {
        return $this->hasMany(InventoryScheduling::class);
    }
}
