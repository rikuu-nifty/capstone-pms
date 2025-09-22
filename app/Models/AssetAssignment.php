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

    protected $appends = ['assigned_by_user'];

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

    public function getAssignedByUserAttribute()
    {
        return $this->assignedBy ? [
            'id' => $this->assignedBy->id,
            'name' => $this->assignedBy->name,
        ] : null;
    }

    public static function indexData(int $perPage = 10): array
    {
        $assignments = static::with([
            'personnel.unitOrDepartment',
            'assignedBy',
            'items.asset.assetModel.category',
        ])
            ->withCount('items')
            ->latest()
            ->paginate($perPage);

        // force include assigned_by in JSON
        $assignments->getCollection()->transform(function ($assignment) {
            return array_merge($assignment->toArray(), [
                'assigned_by' => $assignment->assigned_by,
            ]);
        });

        return [
            'assignments' => $assignments,
            'totals'      => static::totals(),
            'personnels'  => Personnel::activeForAssignments(),
            'units'       => UnitOrDepartment::listForAssignments(),
            'assets'      => InventoryList::listForAssignments(),
        ];
    }

    public static function totals(): array
    {
        $activePersonnels = Personnel::where('status', 'active')->pluck('id');
        $inactivePersonnels = Personnel::where('status', 'inactive')->pluck('id');
        $leftUniversityPersonnels = Personnel::where('status', 'left_university')->pluck('id');

        return [
            'total_assignments'             => static::count(),
            'total_personnels_with_assets'  => static::whereIn('personnel_id', $activePersonnels)->distinct('personnel_id')->count('personnel_id'),
            'total_inactive_personnels_with_assets' => static::whereIn('personnel_id', $inactivePersonnels)->distinct('personnel_id')->count('personnel_id'),
            'total_assets_assigned'         => AssetAssignmentItem::distinct('asset_id')->count('asset_id'),
            'assets_assigned_to_left_university' => AssetAssignmentItem::whereHas('assignment', function ($q) use ($leftUniversityPersonnels) {
                $q->whereIn('personnel_id', $leftUniversityPersonnels);
            })->distinct('asset_id')->count('asset_id'),
        ];
    }
}
