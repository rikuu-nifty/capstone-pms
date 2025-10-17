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
        'equipment_code_id',
        'status',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id')->whereNull('categories.deleted_at');
    }

    public function assets()
    {
        return $this->hasMany(InventoryList::class, 'asset_model_id')
            ->whereNull('inventory_lists.deleted_at');
    }

    public function equipment_code()
{
    return $this->belongsTo(EquipmentCode::class, 'equipment_code_id')
                ->whereNull('equipment_codes.deleted_at');
}

    public function equipmentCode()
    {
        return $this->belongsTo(EquipmentCode::class, 'equipment_code_id');
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
            ->orderByDesc('id');
    }

    public function scopeWithAssetsMinimal($query)
    {
        return $query->with([
            'assets' => function ($q) {
                $q->select('id', 'asset_model_id', 'asset_name', 'serial_no', 'supplier')
                    ->whereNull('deleted_at');
            },
        ]);
    }

    public static function forIndex()
    {
        return static::withCategoryAndCounts()
            ->with(['equipmentCode:id,code,description'])
            ->get();
    }

    public static function findForView($id)
    {
        return static::forViewing()->findOrFail($id);
    }

    public function scopeForViewing($query)
    {
        return $query->withCategoryAndCounts()
            ->withAssetsMinimal()
            ->with(['equipmentCode:id,code,description']);
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
