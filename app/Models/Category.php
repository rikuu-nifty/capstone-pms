<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Category extends Model
{
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
        return $this-> hasManyThrough(
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
                    $q->withCount('assets')
                      ->orderBy('name')
                      ->orderBy('model');
                },
            ])
            ->withCount([
                'assetModels as total_models',
                'assets as total_assets',
            ])
            ->orderBy('name');
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

    public static function getTotals(): array
    {
        return [
            'categories'    => static::count(),
            'asset_models'  => AssetModel::count(),
            'assets'        => InventoryList::count(),
        ];
    }

}
