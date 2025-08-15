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
}
