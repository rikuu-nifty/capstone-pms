<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryList extends Model
{
    protected $fillable = [
        'memorandum_no',
        'asset_model_id',
        'asset_name',
        'description',
        'unit_or_department_id',
        'building_id',
        'building_room_id',
        'category_id',
        'serial_no',
        'supplier',
        'unit_cost',
        'date_purchased',
        'asset_type',
        'quantity',
        'transfer_status',
        'status',
        'image_path',
    ];

    public function assetModel()
    {
        return $this->belongsTo(AssetModel::class, 'asset_model_id')->whereNull('asset_models.deleted_at');
    }

    public function unitOrDepartment()
    {
        return $this->belongsTo(UnitOrDepartment::class);
    }

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function buildingRoom()
    {
        return $this->belongsTo(BuildingRoom::class);
    }

    public function turnoverDisposalAsset()
    {
        return $this->hasMany(TurnoverDisposalAsset::class, 'asset_id');
    }

    public function category() 
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function offCampuses()
    {
        return $this->hasMany(OffCampus::class, 'asset_id');
    }

    public static function kpis(): array
    {
        $total = static::count();

        $active = static::where('status', 'active')->count();
        $archived = static::where('status', 'archived')->count();

        $fixed = static::where('asset_type', 'fixed')->count();
        $notFixed = static::where('asset_type', 'not_fixed')->count();

        $valueSum = static::sumInventoryValue();

        $statusDen = max($active + $archived, 0);
        $typeDen = max($fixed + $notFixed, 0);

        return [
            'total_assets' => $total,
            'total_inventory_sum' => $valueSum,
            'active_pct' => static::pct($active, $statusDen),
            'archived_pct' => static::pct($archived, $statusDen),
            'fixed_pct' => static::pct($fixed, $typeDen),
            'not_fixed_pct' => static::pct($notFixed, $typeDen),
        ];
    }

    protected static function pct(int|float $num, int|float $den): float
    {
        if ($den <= 0) return 0.0;
        return round(($num / $den) * 100, 1);
    }

    public static function sumInventoryValue(): float
    {
        $sum = 0.0;

        static::select(['id', 'quantity', 'unit_cost'])
            ->orderBy('id')
            ->chunkById(500, function ($rows) use (&$sum) {
                foreach ($rows as $row) {
                    $qty  = (int) ($row->quantity ?? 0);
                    $cost = (float) ($row->unit_cost ?? 0);
                    $sum += $qty * $cost;
                }
            });

        return $sum;
    }


    // public function category()
    // {
    //     return $this->belongsTo(Category::class);
    // }

    
    // public function offCampusAsset() // NEED LAGAY
    // {
    //     return $this->hasMany(offCampusAsset::class, 'asset_id');
    // }

}
