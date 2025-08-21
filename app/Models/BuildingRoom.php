<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BuildingRoom extends Model
{
    use SoftDeletes;

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
    
    public function inventorySchedulings()
    {
        return $this->hasMany(InventoryScheduling::class);
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

    public static function listAllRoomsWithAssetShare(int $totalAssets)
    {
        $rooms = static::listAllRooms();

        $rooms->each(function ($r) use ($totalAssets) {
            $assetsCount = (int) ($r->assets_count ?? 0);
            $r->asset_share = $totalAssets > 0
                ? round(($assetsCount / $totalAssets) * 100, 2)
                : 0.00;
        });

        return $rooms;
    }
    
    public static function viewPropsById(int $id)
    {
        return static::query()
            ->select(['id', 'building_id', 'room', 'description'])
            ->with([
                'building:id,code,name',
                'assets' => function ($q) {
                    $q->select([
                        'id',
                        'asset_model_id',
                        'asset_name',
                        'serial_no',
                        'status',
                        'building_room_id',
                    ]);
                },
                'assets.assetModel:id,category_id,brand,model',
                'assets.assetModel.category:id,name',
            ])
            ->withCount('assets')
            ->findOrFail($id);
    }

    public static function viewPropsByIdWithAssetShare(int $id, int $totalAssets)
    {
        $room = static::viewPropsById($id);

        $assetsCount = (int) ($room->assets_count ?? 0);
        $room->asset_share = $totalAssets > 0
            ? round(($assetsCount / $totalAssets) * 100, 2)
            : 0.00;

        return $room;
    }
}
