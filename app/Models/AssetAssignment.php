<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetAssignment extends Model
{
    protected $fillable = [
        'asset_id',
        'unit_or_department_id',
        'personnel_id',
        'assigned_by',
        'date_assigned',
        'remarks',
    ];

    protected $casts = [
        'date_assigned' => 'date',
    ];

    public function asset()
    {
        return $this->belongsTo(InventoryList::class, 'asset_id')
            ->with('assetModel.category');
    }

    public function personnel()
    {
        return $this->belongsTo(Personnel::class, 'personnel_id');
    }

    public function unitOrDepartment()
    {
        return $this->belongsTo(UnitOrDepartment::class, 'unit_or_department_id');
    }
    
    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public static function listForIndex(int $perPage = 10)
    {
        return static::with([
            'asset.assetModel.category',
            'personnel',
            'unitOrDepartment',
            'assignedBy',
        ])
        ->latest()
        ->paginate($perPage);
    }

    public static function totals(): array
    {
        return [
            'total_assignments'             => static::count(),
            'total_personnels_with_assets'  => static::distinct('personnel_id')->count('personnel_id'),
            'total_assets_assigned'         => static::distinct('asset_id')->count('asset_id'),
        ];
    }
}
