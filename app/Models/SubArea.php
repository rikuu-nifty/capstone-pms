<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubArea extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'building_room_id',
        'name',
        'description',
    ];

    /**
     * Relationships
     */

    // Each sub-area belongs to a building room
    public function room()
    {
        return $this->belongsTo(BuildingRoom::class, 'building_room_id');
    }

    public function assets()
    {
        return $this->hasMany(InventoryList::class, 'sub_area_id');
    }

    // If you want: get all transferAssets that reference this sub-area
    public function transferAssetsFrom()
    {
        return $this->hasMany(TransferAsset::class, 'from_sub_area_id');
    }

    public function transferAssetsTo()
    {
        return $this->hasMany(TransferAsset::class, 'to_sub_area_id');
    }
}
