<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetModel extends Model
{
    // Optional: Define the table name explicitly if you used a different name
    // protected $table = 'tbl_asset_model';

    // Define fillable fields for mass assignment
    protected $fillable = [
        'brand',
        'model',
        'category_id',
        'status',
    ];

    //  Relationship: AssetModel belongs to a Category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // ✅ (Optional) Relationship: AssetModel has many InventoryList entries
    public function inventoryLists()
    {
        return $this->hasMany(InventoryList::class);
    }
}
