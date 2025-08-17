<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AssetModel extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'brand',
        'model',
        'category_id',
        'status',
    ];

    //  Relationship: AssetModel belongs to a Category
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    // ✅ (Optional) Relationship: AssetModel has many InventoryList entries
    public function assets()
    {
        return $this->hasMany(InventoryList::class, 'asset_model_id');
    }

        // AssetModel.php // Relationship to OffCampus table (via asset_model_id FK)
    public function offCampuses()
    {
        return $this->hasMany(OffCampus::class, 'asset_model_id');
    }

    // // User.php
    // public function issuedOffCampuses()
    // {
    //     return $this->hasMany(OffCampus::class, 'issued_by_id');
    // }
}
