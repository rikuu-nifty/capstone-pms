<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

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
        return $this->belongsTo(Category::class, 'category_id')
            ->whereNull('categories.deleted_at');
    }

    // ✅ (Optional) Relationship: AssetModel has many InventoryList entries
    public function assets()
    {
        return $this->hasMany(InventoryList::class, 'asset_model_id')
            ->whereNull('inventory_lists.deleted_at');
    }

    public function scopeWithCategoryAndCounts($query)
    {
        return $query->with(['category:id,name'])
            ->withCount([
                'assets as assets_count',
                'assets as active_assets_count' => function ($q) {
                    $q->where('status', 'active');
                },
            ])
            ->orderBy('id', 'desc');
    }

    //KPIs
    public static function getTotals(): array
    {
        $distinctBrands = static::query()
            ->whereNull('deleted_at')
            ->whereNotNull('brand')
            ->where('brand', '<>', '')
            ->selectRaw('COUNT(DISTINCT LOWER(TRIM(brand))) as cnt')
            ->value('cnt');

        $totalAssets = InventoryList::count();
        $totalActiveAssets = InventoryList::query()->where('status', 'active')->count();

        return [
            'asset_models'      => static::count(),
            'assets'            => $totalAssets,
            'distinct_brands'   => $distinctBrands,
            'active_assets'     => $totalActiveAssets,
        ];
    }

    public static function categoriesForDropdown() //static kasi no constraits and returns final collection
    {
        return Category::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
    }
}
