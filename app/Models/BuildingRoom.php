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

    // Each room belongs to a building
    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    // 🔁 Each room can be linked to inventory assets
    public function inventoryLists()
    {
        return $this->hasMany(InventoryList::class);
    }
}
