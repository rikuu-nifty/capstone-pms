<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class Building extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'name',
        'code',
        'description',
    ];

    public function buildingRooms()
    {
        return $this->hasMany(BuildingRoom::class);
    }

    public function assets(): HasManyThrough
    {
        return $this->hasManyThrough(
            InventoryList::class,
            BuildingRoom::class,
            'building_id',
            'building_room_id',
            'id',
            'id',
        )
        ->whereNull('inventory_lists.deleted_at');
    }

    public static function indexProps()
    {
        return static::query()
            ->select('id', 'name', 'code', 'description')
            ->withCount(['buildingRooms', 'assets']) //automatically creates fields building_rooms_count and assets_count
            ->orderBy('code')
            ->get();
    }

    public static function showPropsById (int $id)
    {
        return static::query()
            ->select('id', 'name', 'code', 'description')
            ->withCount(['buildingRooms', 'assets'])
            ->with([
                'buildingRooms:id,building_id,room',
                'buildingRooms:assets:id,building_room_id,serial_no,unit_or_department_id'
            ])
            ->findOrFail($id);
    }

    public function inventoryLists()
    {
        return $this->hasMany(InventoryList::class);
    }
    
     public function inventorySchedulings()
    {
        return $this->hasMany(InventoryScheduling::class);
    }
}
