<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Models\Category;
use App\Models\AssetModel;
use App\Models\InventoryList;

class EquipmentCode extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'description',
        'category_id',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function assetModels()
    {
        return $this->hasMany(AssetModel::class, 'equipment_code_id');
    }

    public function assets()
    {
        return $this->hasManyThrough(
            InventoryList::class,
            AssetModel::class,
            'equipment_code_id', // FK on asset_models
            'asset_model_id',    // FK on inventory_lists
            'id',                // PK on equipment_codes
            'id'                 // PK on asset_models
        );
    }

    public static function withCategoryAndCounts($perPage = 10)
    {
        return static::query()
            ->with([
                'category',
                'assetModels' => function ($q) {
                    $q->withCount('assets');
                },
            ])
            ->withCount(['assetModels', 'assets'])
            ->paginate($perPage)
            ->through(function ($code) {
                $code->category_name = $code->category?->name;
                return $code;
            });
    }

    public static function getTotals(): array
    {
        $totalCodes   = self::count();
        $totalModels  = AssetModel::count();

        $unusedCodes = self::doesntHave('assetModels')->count();
        $usedCodes   = $totalCodes - $unusedCodes;

        $usedPct   = $totalCodes > 0 ? round(($usedCodes / $totalCodes) * 100, 1) : 0;
        $unusedPct = $totalCodes > 0 ? round(($unusedCodes / $totalCodes) * 100, 1) : 0;

        $topCategories = Category::withCount('equipmentCodes')
            ->orderByDesc('equipment_codes_count')
            ->take(5)
            ->get(['id', 'name', 'equipment_codes_count']);

        $avgModelsPerCode = $totalCodes > 0 ? round($totalModels / $totalCodes, 1) : 0;

        $topCodes = self::withCount('assetModels')
            ->orderByDesc('asset_models_count')
            ->take(5)
            ->get(['id', 'code', 'description', 'asset_models_count']);

        return [
            'total_codes'           => $totalCodes,
            'unused_codes'          => $unusedCodes,
            'used_codes'            => $usedCodes,
            'avg_models_per_code'   => $avgModelsPerCode,
            'top_categories'        => $topCategories,
            'top_codes'             => $topCodes,

            'used_percentage'     => $usedPct,
            'unused_percentage'   => $unusedPct,
        ];
    }


    public static function getAllCategories()
    {
        return Category::orderBy('name')->get(['id', 'name']);
    }

    public static function findForView(int $id): ?self
    {
        return self::with(['category', 'assetModels'])->find($id);
    }
}
