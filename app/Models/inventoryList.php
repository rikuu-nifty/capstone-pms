<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryList extends Model
{
    protected $fillable = [
        'memorandum_no',
        'asset_model_id',
        'asset_name',
        'description',
        'unit_or_department_id',
        'building_id',
        'building_room_id',
        'serial_no',
        'supplier',
        'unit_cost',
        'date_purchased',
        'asset_type',
        'quantity',
        'transfer_status',
    ];

    // 🔗 Relationships and eto na yun FK Relationships
    public function assetModel()
    {
        return $this->belongsTo(AssetModel::class);
    }

    public function unitOrDepartment()
    {
        return $this->belongsTo(UnitOrDepartment::class);
    }

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function buildingRoom()
    {
        return $this->belongsTo(BuildingRoom::class);
    }
}
