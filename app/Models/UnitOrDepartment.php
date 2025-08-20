<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UnitOrDepartment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'unit_head',
    ];

    public function inventoryLists()
    {
        return $this->hasMany(InventoryList::class, 'unit_or_department_id');
    }

    public function inventorySchedulings()
    {
        return $this->hasMany(InventoryScheduling::class);
    }

    public function issuingOffice()
    {
        return $this->hasMany(TurnoverDisposal::class, 'issuing_office');
    }

    public function receivingOffice()
    {
        return $this->hasMany(TurnoverDisposal::class, 'receiving_office');
    }

    public function assetAssignment()
    {
        return $this->hasMany(AssetAssignment::class, 'unit_or_department_id');
    }

    public function scopewithAssetsCount($query)
    {
        return $query->withCount(['inventoryLists as assets_count']);
    }

    public static function listForIndex()
    {
        return static::query()
            ->withAssetsCount()
            ->latest()
            ->get();
    }

    public static function totals(): array
    {
        return [
            'total_units' => static::count(),
            'total_assets' => InventoryList::count(),
        ];
    }

    public static function viewPropsById(int $id)
    {
        return static::query()
            ->withCount(['inventoryLists as assets_count'])
            ->with([
                'inventoryLists' => function ($q) {
                    $q->select([
                        'id',
                        'asset_name',
                        'unit_or_department_id',
                        'serial_no',
                        'asset_model_id',
                        'building_room_id',
                    ])
                    ->latest()
                    ->with([
                        'assetModel:id,category_id',
                        'assetModel.category:id,name',
                        'buildingRoom:id,room,building_id',
                        'buildingRoom.building:id,code',
                    ]);
                },
            ])
            ->findOrFail($id, ['id', 'name', 'code', 'description', 'unit_head']);
    }

}
