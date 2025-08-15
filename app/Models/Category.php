<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'name',
        'description',
    ];

    // A Category has many Asset Models
    public function assetModels(): HasMany
    {
        return $this->hasMany(AssetModel::class, 'category_id');
    }

    public function assets(): HasManyThrough
    {
        return $this->hasManyThrough(
            InventoryList::class, //final model
            AssetModel::class, //through model
            'category_id', //FK on asset_models pointing to Category
            'asset_model_id', //FK on inventory_lists pointing to asset_models
            'id', //local key on category
            'id', //local key on asset model
        );
    }

    public function scopeWithModelsAndCounts($query)
    {
        return $query->with([
            'assetModels' => function ($q) {
                $q->with('category:id,name')
                    ->withCount('assets')
                    ->orderBy('brand')
                    ->orderBy('model');
            },
        ])
        ->withCount([
            'assetModels as models_count',
            'assets as assets_count',
            'assetModels as brands_count' => function ($q) {
                $q->select(DB::raw("COUNT(DISTINCT NULLIF(TRIM(brand), ''))"))
                  ->whereNotNull('brand')
                  ->where('brand', '<>', '');
            },
        ])
        ->orderBy('id', 'asc');
    }

    public function scopeCategoryCounts($query)
    {
        return $query
            ->select(['id', 'name'])
            ->withCount([
                'assetModels as total_models',
                'assets as total_assets',
            ]);
    }

    //for future KPI totals overall
    public static function getTotals(): array
    {
        return [
            'categories'    => static::count(),
            'asset_models'  => AssetModel::count(),
            'assets'        => InventoryList::count(),
        ];
    }

    //single row modal deep-link
    public static function findForView(int $id): self
    {
        return static::withModelsAndCounts()->findOrFail($id);
    }

}
