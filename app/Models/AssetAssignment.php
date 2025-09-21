<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AssetAssignment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'personnel_id',
        'assigned_by',
        'date_assigned',
        'remarks',
    ];

    protected $casts = [
        'date_assigned' => 'date',
    ];

    public function personnel()
    {
        return $this->belongsTo(Personnel::class, 'personnel_id');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function items()
    {
        return $this->hasMany(AssetAssignmentItem::class);
    }

    public static function indexData(int $perPage = 10): array
    {
        return [
            'assignments' => static::with([
                'personnel.unitOrDepartment',
                'assignedBy',
                'items.asset.assetModel.category',
            ])
                ->withCount('items')
                ->latest()
                ->paginate($perPage),

            'totals'     => static::totals(),
            'personnels' => Personnel::activeForAssignments(),
            'units'      => UnitOrDepartment::listForAssignments(),
            'assets'     => InventoryList::listForAssignments(),
        ];
    }

    public static function totals(): array
    {
        return [
            'total_assignments'             => static::count(),
            'total_personnels_with_assets'  => static::distinct('personnel_id')->count('personnel_id'),
            'total_assets_assigned'         => AssetAssignmentItem::distinct('asset_id')->count('asset_id'),
        ];
    }
}
