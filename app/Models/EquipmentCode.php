<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Category;
use App\Models\AssetModel;
use Illuminate\Database\Eloquent\SoftDeletes;

class EquipmentCode extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code_number',
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

    public static function withCategoryAndCounts()
    {
        return self::with('category')
            ->withCount('assetModels')
            ->get();
    }

    public static function getTotals(): array
    {
        return [
            'equipment_codes' => self::count(),
            'categories'      => Category::count(),
            'asset_models'    => AssetModel::count(),
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
