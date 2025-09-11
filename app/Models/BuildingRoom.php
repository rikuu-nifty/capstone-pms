<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class BuildingRoom extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'building_id',
        'room',
        'description',
    ];

    public function inventoryLists()
    {
        return $this->hasMany(InventoryList::class, 'building_room_id');
    }

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function subAreas()
    {
        return $this->hasMany(SubArea::class, 'building_room_id');
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
            ->with(['subAreas:id,building_room_id,name,description'])
            ->withCount('assets')
            ->orderBy('building_id')
            ->orderBy('room')
            ->get(['id', 'building_id', 'room', 'description'])
        ;
    }

    public static function listAllRoomsForUnit(int $unitId)
    {
        return static::query()
            ->with(['building:id,code,name'])
            ->with(['subAreas:id,building_room_id,name,description'])
            ->withCount([
                // filtered assets count for the user’s unit
                'assets as assets_count' => fn($q) => $q->where('unit_or_department_id', $unitId),
            ])
            ->whereHas(
                'assets',
                fn($q) =>
                $q->where('unit_or_department_id', $unitId)
            )
            ->orderBy('building_id')
            ->orderBy('room')
            ->get(['id', 'building_id', 'room', 'description']);
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

    public static function listAllRoomsWithAssetShare(int $totalAssets, ?User $user = null)
    {
        $rooms = $user &&
            $user->hasPermission('view-own-unit-buildings') &&
            !$user->hasPermission('view-buildings') &&
            $user->unit_or_department_id
            ? static::listAllRoomsForUnit($user->unit_or_department_id)
            : static::listAllRooms();

        $rooms->each(function ($r) use ($totalAssets) {
            $assetsCount = (int) ($r->assets_count ?? 0);
            $r->asset_share = $totalAssets > 0
                ? round(($assetsCount / $totalAssets) * 100, 2)
                : 0.00;
        });

        return $rooms;
    }

    public static function listAllRoomsWithAssetShareForUnit(int $totalAssets, int $unitId)
    {
        $rooms = static::listAllRoomsForUnit($unitId);

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
                'subAreas:id,building_room_id,name,description',
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
                'assets.subArea:id,name,building_room_id',
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

    public static function viewPropsByIdForUserWithAssetShare(int $id, int $totalAssets)
    {
        $room = static::viewPropsByIdForUser($id);

        $assetsCount = (int) ($room->assets_count ?? 0);
        $room->asset_share = $totalAssets > 0
            ? round(($assetsCount / $totalAssets) * 100, 2)
            : 0.00;

        return $room;
    }

    public static function viewPropsByIdForUser(int $id, ?int $totalAssets = null)
    {
        /** @var User|null $user */
        $user = Auth::user();

        $query = static::query()
            ->select(['id', 'building_id', 'room', 'description'])
            ->with([
                'building:id,code,name',
                'subAreas:id,building_room_id,name,description',
                'assets' => function ($q) use ($user) {
                    $q->select([
                        'id',
                        'asset_model_id',
                        'asset_name',
                        'serial_no',
                        'status',
                        'building_room_id',
                        'unit_or_department_id',
                    ]);

                    // 🔹 Restrict to user's unit if they only have "view-own"
                    if ($user->hasPermission('view-own-unit-inventory-list') && !$user->hasPermission('view-inventory-list')) {
                        $q->where('unit_or_department_id', $user->unit_or_department_id);
                    }
                },
                'assets.assetModel:id,category_id,brand,model',
                'assets.assetModel.category:id,name',
            ])
            ->withCount(['assets' => function ($q) use ($user) {
                if ($user->hasPermission('view-own-unit-inventory-list') && !$user->hasPermission('view-inventory-list')) {
                    $q->where('unit_or_department_id', $user->unit_or_department_id);
                }
            }]);

        $room = $query->findOrFail($id);

        // 🔹 Calculate asset share if requested
        if ($totalAssets !== null) {
            $assetsCount = (int) ($room->assets_count ?? 0);
            $room->asset_share = $totalAssets > 0
                ? round(($assetsCount / $totalAssets) * 100, 2)
                : 0.00;
        }

        return $room;
    }
}
