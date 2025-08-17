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

    public static function listAllRooms()
    {
        return static::query()
            ->with(['building:id,code,name'])
            ->withCount('assets')
            ->orderBy('building_id')
            ->orderBy('room')
            ->get(['id', 'building_id', 'room', 'description'])
        ;
    }
    
    public function scopeForSingleBuilding($query, int $buildingId)
    {
        return $query->where('building_id', $buildingId);
    }

    public static function listForBuilding(int $buildingId)
    {
        return static::query()
            ->forSingleBuilding($buildingId)
            ->with(['building:id,code,name'])
            ->withCount('assets')
            ->orderBy('room')
            ->get(['id', 'building_id', 'room', 'description'])
        ;
    }

    public function inventorySchedulings()
    {
        return $this->hasMany(InventoryScheduling::class);
    }
}
