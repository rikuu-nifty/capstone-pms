<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Building extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
    ];

    // Relationship: Building has many building rooms
    public function buildingRooms()
    {
        return $this->hasMany(BuildingRoom::class);
    }

    // Optional: Building has many inventory assets
    public function inventoryLists()
    {
        return $this->hasMany(InventoryList::class);
    }
}
