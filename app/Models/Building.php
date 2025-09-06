<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Building extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'name',
        'code',
        'description',
    ];

    public function inventoryLists()
{
    return $this->hasMany(InventoryList::class, 'building_id');
}

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

    public static function indexProps(?User $user = null)
    {
        $q = static::query()
            ->select('id', 'name', 'code', 'description')
            ->orderBy('id', 'desc');

        $withCount = [
            'buildingRooms',
            'assets',
        ];

        if (
            $user
            && $user->hasPermission('view-own-unit-buildings')
            && !$user->hasPermission('view-buildings')
            && $user->unit_or_department_id
        ) {
            $unitId = (int) $user->unit_or_department_id;

            $withCount = [
                'buildingRooms as building_rooms_count' => function ($q) use ($unitId) {
                    $q->whereHas('assets', fn($qq) => $qq->where('unit_or_department_id', $unitId));
                },
                'assets as assets_count' => fn($qq) => $qq->where('unit_or_department_id', $unitId),
            ];

            // also show only buildings that have assets for this unit
            $q->whereHas('assets', fn($qq) => $qq->where('unit_or_department_id', $unitId));
        }

        return $q->withCount($withCount)->get();
    }

    public static function showPropsById (int $id)
    {
        return static::query()
            ->select('id', 'name', 'code', 'description')
            ->withCount(['buildingRooms', 'assets'])
            ->with([
                'buildingRooms:id,building_id,room',
                'buildingRooms.assets:id,building_room_id,serial_no,unit_or_department_id',
            ])
            ->findOrFail($id);
    }

    public static function showPropsByIdForUser(int $id)
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        $query = static::query()
            ->select('id', 'name', 'code', 'description')
            ->withCount([
                'buildingRooms as building_rooms_count' => function ($q) use ($user) {
                    if (
                        $user &&
                        $user->hasPermission('view-own-unit-buildings') &&
                        !$user->hasPermission('view-buildings')
                    ) {
                        $q->whereHas('assets', function ($qq) use ($user) {
                            $qq->where('unit_or_department_id', $user->unit_or_department_id);
                        });
                    }
                },
                'assets as assets_count' => function ($q) use ($user) {
                    if (
                        $user &&
                        $user->hasPermission('view-own-unit-buildings') &&
                        !$user->hasPermission('view-buildings')
                    ) {
                        $q->where('unit_or_department_id', $user->unit_or_department_id);
                    }
                },
            ])
            ->with([
                'buildingRooms' => function ($q) use ($user) {
                    $q->select('id', 'building_id', 'room');

                    if (
                        $user &&
                        $user->hasPermission('view-own-unit-buildings') &&
                        !$user->hasPermission('view-buildings')
                    ) {
                        $q->whereHas('assets', function ($qq) use ($user) {
                            $qq->where('unit_or_department_id', $user->unit_or_department_id);
                        });
                    }

                    $q->with(['assets' => function ($qq) use ($user) {
                        $qq->select([
                            'id',
                            'building_room_id',
                            'serial_no',
                            'unit_or_department_id',
                        ]);

                        if (
                            $user &&
                            $user->hasPermission('view-own-unit-buildings') &&
                            !$user->hasPermission('view-buildings')
                        ) {
                            $qq->where('unit_or_department_id', $user->unit_or_department_id);
                        }
                    }]);
                },
            ]);

        return $query->findOrFail($id);
    }

    public function inventorySchedulings()
    {
        return $this->hasMany(InventoryScheduling::class);
    }

    // app/Models/Building.php
    public function syncRooms(array $rooms): void
    {
        $existingRoomIds = $this->buildingRooms()->pluck('id')->toArray();
        $incomingIds = collect($rooms)->pluck('id')->filter()->toArray();

        // Delete removed
        $toDelete = array_diff($existingRoomIds, $incomingIds);
        if (!empty($toDelete)) {
            BuildingRoom::whereIn('id', $toDelete)->delete();
        }

        // Upsert
        foreach ($rooms as $roomData) {
            if (!empty($roomData['id'])) {
                $room = BuildingRoom::find($roomData['id']);
                if ($room) {
                    $room->update([
                        'room' => $roomData['room'],
                        'description' => $roomData['description'] ?? null,
                    ]);
                }
            } else {
                $this->buildingRooms()->create([
                    'room' => $roomData['room'],
                    'description' => $roomData['description'] ?? null,
                ]);
            }
        }
    }
}
