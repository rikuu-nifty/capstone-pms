<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

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
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime',
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
            'personnel:id,first_name,middle_name,last_name,position,unit_or_department_id,status',
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
                'updated_at'  => $assignment->updated_at,
            ]);
        });

        return [
            'assignments' => $assignments,
            'totals'      => static::totals(),
            'personnels'  => Personnel::activeForAssignments(),
            'available_personnels' => Personnel::availableForNewAssignments(),
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
            'assignments_with_no_assets'          => static::doesntHave('items')->count(),
        ];
    }

    public static function paginatedAssetsForPersonnel(int $personnelId, int $perPage = 10)
    {
        return AssetAssignmentItem::with([
            'asset.assetModel.category',
            'asset.unitOrDepartment',
            'asset.building',
            'asset.buildingRoom',
            'asset.subArea',
            'assignment' => fn($q) => $q->withTrashed(),
        ])
            ->whereHas('assignment', fn($q) => $q->withTrashed()->where('personnel_id', $personnelId))
            ->paginate($perPage);
    }

    public static function reassignItemToPersonnel(AssetAssignmentItem $item, int $newPersonnelId, int $userId)
    {
        return DB::transaction(function () use ($item, $newPersonnelId, $userId) {
            $assignment = AssetAssignment::firstOrCreate(
                ['personnel_id' => $newPersonnelId],
                [
                    'assigned_by' => $userId,
                    'date_assigned' => now(),
                ]
            );

            $item->update(['asset_assignment_id' => $assignment->id]);
            return $item;
        });
    }

    public static function bulkReassignPersonnelAssets(int $fromPersonnelId, int $toPersonnelId, int $userId)
    {
        return DB::transaction(function () use ($fromPersonnelId, $toPersonnelId, $userId) {
            $assignment = AssetAssignment::firstOrCreate(
                ['personnel_id' => $toPersonnelId],
                [
                    'assigned_by' => $userId,
                    'date_assigned' => now(),
                ]
            );

            return AssetAssignmentItem::whereHas('assignment', fn($q) => $q->where('personnel_id', $fromPersonnelId))
                ->update(['asset_assignment_id' => $assignment->id]);
        });
    }
}
