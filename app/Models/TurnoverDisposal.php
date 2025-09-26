<?php

namespace App\Models;

use App\Models\Concerns\HasFormApproval;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class TurnoverDisposal extends Model
{
    use SoftDeletes;
    use HasFormApproval;

    protected $fillable = [
        'issuing_office_id',
        'type',
        'receiving_office_id',
        'description',
        'personnel_in_charge',
        'document_date',
        'status',
        'remarks',
    ];

    protected $casts = 
    [
        'document_date' => 'date',
    ];

    // protected $appends = ['noted_by_name'];

    public function turnoverDisposalAssets() 
    {
        return $this->hasMany(TurnoverDisposalAsset::class, 'turnover_disposal_id');
    }

    public function issuingOffice() 
    {
        return $this->belongsTo(UnitOrDepartment::class, 'issuing_office_id');
    }

    public function receivingOffice() 
    {
        return $this->belongsTo(UnitOrDepartment::class, 'receiving_office_id');
    }

    public static function assetBelongsToOffice(array $assetIds, int $officeId): void
    {
        if (empty($assetIds)) {
            throw ValidationException::withMessages([
                'selected_assets' => 'Please select at least one asset.',
            ]);
        }

        $count = InventoryList::whereIn('id', $assetIds)
            ->where('unit_or_department_id', $officeId)
            ->count();

        if ($count !== count($assetIds)) {
            throw ValidationException::withMessages([
                'selected_assets' => 'All selected assets must belong to the issuing office.',
            ]);
        }
    }

    public static function assertLinesBelongToOffice(array $lineItems, int $officeId): void
    {
        $assetIds = [];
        foreach ($lineItems as $li) {
            if (!is_array($li)) continue;
            if (!isset($li['asset_id'])) continue;
            $id = (int) $li['asset_id'];
            if ($id > 0) $assetIds[] = $id;
        }
        $assetIds = array_values(array_unique($assetIds));

        if (count($assetIds) === 0) {
            throw ValidationException::withMessages([
                'turnover_disposal_assets' => 'Please select at least one asset.',
            ]);
        }

        $count = InventoryList::whereIn('id', $assetIds)
            ->where('unit_or_department_id', $officeId)
            ->count();

        if ($count !== count($assetIds)) {
            throw ValidationException::withMessages([
                'turnover_disposal_assets' => 'All selected assets must belong to the issuing office.',
            ]);
        }
    }

    protected function assertLinesBelongToEitherOffice(array $lineItems, int $issuingOfficeId): void
    {
        $assetIds = [];
        foreach ($lineItems as $li) {
            if (is_array($li) && isset($li['asset_id'])) {
                $id = (int) $li['asset_id'];
                if ($id > 0) $assetIds[] = $id;
            }
        }
        $assetIds = array_values(array_unique($assetIds));

        if (count($assetIds) === 0) {
            throw ValidationException::withMessages([
                'turnover_disposal_assets' => 'Please select at least one asset.',
            ]);
        }

        $allowedOffices = array_values(array_filter([
            (int) $issuingOfficeId,
            (int) $this->receiving_office_id,
        ]));

        $count = InventoryList::whereIn('id', $assetIds)
            ->whereIn('unit_or_department_id', $allowedOffices)
            ->count();

        if ($count !== count($assetIds)) {
            throw ValidationException::withMessages([
                'turnover_disposal_assets' => 'All selected assets must belong to the issuing or receiving office for this record.',
            ]);
        }
    }

    public static function createWithLines(array $details, array $lineItems): self
    {
        return DB::transaction(function () use ($details, $lineItems) {
            /** @var self $record */
            $record = static::create($details);

            // Validate against issuing OR receiving office for THIS record
            $record->assertLinesBelongToEitherOffice($lineItems, (int) $details['issuing_office_id']);

            $record->syncLines($lineItems);

            return $record->fresh(['turnoverDisposalAssets']);
        });
    }

    public function updateWithLines(array $details, array $lineItems): self
    {
        return DB::transaction(function () use ($details, $lineItems) {
            $this->updateDetails($details);

            $this->assertLinesBelongToEitherOffice($lineItems, (int) $details['issuing_office_id']);

            $this->syncLines($lineItems);

            return $this->fresh(['turnoverDisposalAssets']);
        });
    }

    public function syncLines(array $lineItems): void
    {
        $keptIds = [];

        foreach ($lineItems as $item) {
            if (!is_array($item)) continue;

            $assetId       = isset($item['asset_id']) ? (int) $item['asset_id'] : 0;
            if ($assetId <= 0) continue;

            $newStatus     = isset($item['asset_status']) ? (string) $item['asset_status'] : 'pending';
            $dateFinalized = $item['date_finalized'] ?? null;
            $remarks       = $item['remarks'] ?? null;

            /** @var TurnoverDisposalAsset $detail */
            $detail = $this->turnoverDisposalAssets()->firstOrNew(['asset_id' => $assetId]);
            $prevStatus = $detail->exists ? (string) $detail->asset_status : null;

            $detail->asset_status   = $newStatus;
            $detail->date_finalized = $dateFinalized;
            $detail->remarks        = $remarks;
            $detail->save();

            $keptIds[] = $detail->id;

            // Apply forward (to completed) OR reverse (away from completed)
            $this->applySideEffectsTransition($detail, $prevStatus);
        }

        // Remove any lines not present in payload
        $this->turnoverDisposalAssets()
            ->whereNotIn('id', $keptIds)
            ->delete();
    }

    protected function applySideEffectsTransition(TurnoverDisposalAsset $line, ?string $previous): void
    {
        if (!$line->asset_id) return;

        /** @var InventoryList|null $asset */
        $asset = $line->assets()->lockForUpdate()->first();
        if (!$asset) return;

        // Transition INTO completed
        if ($line->asset_status === 'completed' && $previous !== 'completed') {
            if ($this->type === 'turnover') {
                if ($this->receiving_office_id) {
                    $asset->unit_or_department_id = $this->receiving_office_id;
                    $asset->save();
                }
            } else { // disposal
                $asset->status = 'archived';
                $asset->save();
            }
            return;
        }

        if ($previous === 'completed' && $line->asset_status !== 'completed') {
            if ($this->type === 'turnover') {
                if ($this->issuing_office_id) {
                    $asset->unit_or_department_id = $this->issuing_office_id;
                    $asset->save();
                }
            } else { // disposal
                // Un-archive since it's no longer completed
                $asset->status = 'active';
                $asset->save();
            }
        }
    }
    
    public static function createWithAssets(array $details, array $assetIds): self
    {
        return DB::transaction(function () use ($details, $assetIds) {
            static::assetBelongsToOffice($assetIds, (int) $details['issuing_office_id']);

            $td = static::create($details);
            $td->addAssetsByIds($assetIds);
            $td->archiveAssetsIfDisposal($assetIds);

            return $td;
        });
    }

    protected function applySideEffectsIfCompleted(TurnoverDisposalAsset $line): void
    {
        if ($line->asset_status !== 'completed' || !$line->asset_id) {
            return;
        }

        /** @var InventoryList|null $asset */
        $asset = $line->assets()->lockForUpdate()->first();
        if (!$asset) return;

        if ($this->type === 'turnover') {
            if ($this->receiving_office_id) {
                $asset->unit_or_department_id = $this->receiving_office_id;
                $asset->save();
            }
        } else { // disposal
            $asset->status = 'archived'; // your “disposed/archived” state
            $asset->save();
        }
    }

    public function updateDetails(array $payload): void
    {
        $this->fill([
            'issuing_office_id'   => $payload['issuing_office_id'],
            'type'                => $payload['type'],
            'receiving_office_id' => $payload['receiving_office_id'],
            'description'         => $payload['description'] ?? null,
            'personnel_in_charge' => $payload['personnel_in_charge'],
            'document_date'       => $payload['document_date'],
            'status'              => $payload['status'],
            'remarks'             => $payload['remarks'] ?? null,
        ])->save();
    }

    public function updateWithAssets(array $details, array $assetIds): self
    {
        return DB::transaction(function () use ($details, $assetIds) {
            
            static::assetBelongsToOffice($assetIds, (int) $details['issuing_office_id']);

            $this->updateDetails($details);

            $toRemoveCount = $this->turnoverDisposalAssets()
                ->whereNotIn('asset_id', $assetIds)
                ->count();

            ($toRemoveCount <= 50)
            ? $this->removeUnlinkedAssetsWithAudit($assetIds)
            : $this->removeUnlinkedAssetsBulk($assetIds);

            $this->addAssetsByIds($assetIds);
            $this->archiveAssetsIfDisposal($assetIds);

            return $this->fresh(); // return latest state
        });
    }

    public function removeUnlinkedAssetsBulk(array $assetIds): int
    {
        return $this->turnoverDisposalAssets()
            ->whereNotIn('asset_id', $assetIds)
            ->delete();
    }

    public function removeUnlinkedAssetsWithAudit(array $assetIds): void
    {
        $this->turnoverDisposalAssets()
            ->whereNotIn('asset_id', $assetIds)
            ->get()
            ->each
            ->delete();
    }

    public function addAssetsByIds(array $assetIds): void
    {
        $existing = $this->turnoverDisposalAssets()
            ->pluck('asset_id')
            ->all();

        foreach (array_diff($assetIds, $existing) as $id) {
            $this->turnoverDisposalAssets()->create(['asset_id' => $id]);
        }
    }

    public function archiveAssetsIfDisposal(array $assetIds): void
    {
        if ($this->type !== 'disposal') {
            return;
        }

        if ($this->status === 'completed') {
            InventoryList::whereIn('id', $assetIds)->update(['status' => 'archived']);
        } else {
            InventoryList::whereIn('id', $assetIds)->update(['status' => 'active']);
        }
    }

    public function softDeleteRelatedAssets(): void
    {
        $count = $this->turnoverDisposalAssets()->count();

        if ($count <= 50) {
            $this->turnoverDisposalAssets()
                ->get()
                ->each
                ->delete();
        } else {
            $this->turnoverDisposalAssets()
                ->update(['deleted_at' => Carbon::now()]);
        }
    }

    public function approvalFormTitle(): string
    {
        return 'Turnover/Disposal -  #' . $this->id;
    }

    public function getNotedByNameAttribute(): ?string
    {
        $fa = $this->relationLoaded('formApproval') ? $this->getRelation('formApproval')
            : $this->formApproval()->with([
                'steps' => fn($q) => $q->whereIn('code', ['external_noted_by','noted_by'])
                    ->where('status','approved')
                    ->orderByDesc('acted_at'),
                'steps.actor:id,name',
            ])->first();

        $step = $fa?->steps->first();
            return $step ? ($step->is_external ? ($step->external_name ?: null) : ($step->actor->name ?? null))
                : null;
    }

    public function getNotedByTitleAttribute(): ?string
    {
        $fa = $this->relationLoaded('formApproval') ? $this->getRelation('formApproval')
            : $this->formApproval()->with([
                'steps' => fn($q) => $q->whereIn('code', ['external_noted_by','noted_by'])
                    ->where('status','approved')
                    ->orderByDesc('acted_at'),
                'steps.actor:id,name',
            ])->first();

        $step = $fa?->steps->first();

        return $step ? ($step->is_external ? ($step->external_title ?: null) : null) : null;
    }

    /*
        REPORTS
    */

    public static function filterAndPaginate(array $filters, int $perPage = 10)
    {
        $query = static::with([
            'issuingOffice:id,name,code',
            'receivingOffice:id,name,code',
            'turnoverDisposalAssets.assets.assetModel.category:id,name', 
            'turnoverDisposalAssets.assets.unitOrDepartment:id,name',
            'turnoverDisposalAssets.assets.building:id,name',
            'turnoverDisposalAssets.assets.buildingRoom:id,room,building_id',
            'turnoverDisposalAssets.assets.subArea:id,name,building_room_id',
        ])
            ->when($filters['from'] ?? null, fn($q, $from) => $q->whereDate('document_date', '>=', $from))
            ->when($filters['to'] ?? null, fn($q, $to) => $q->whereDate('document_date', '<=', $to))
            ->when($filters['issuing_office_id'] ?? null, function ($q, $issuing) {
                $q->where('issuing_office_id', $issuing);
            })
            ->when($filters['receiving_office_id'] ?? null, function ($q, $receiving) {
                $q->where('receiving_office_id', $receiving);
            })
            ->when($filters['status'] ?? null, fn($q, $status) => $q->where('status', $status))
            ->when($filters['building_id'] ?? null, function ($q, $bldg) {
                $q->whereHas('turnoverDisposalAssets.assets', fn($qa) => $qa->where('building_id', $bldg));
            })
            ->when($filters['room_id'] ?? null, function ($q, $room) {
                $q->whereHas('turnoverDisposalAssets.assets', fn($qa) => $qa->where('building_room_id', $room));
            })
            ->when($filters['category_id'] ?? null, function ($q, $catId) {
                $q->whereHas('turnoverDisposalAssets.assets.assetModel', function ($qa) use ($catId) {
                    $qa->where('category_id', $catId);
                });
            })
            ->when($filters['brand'] ?? null, function ($q, $brand) {
                $q->whereHas('turnoverDisposalAssets.assets.assetModel', fn($qa) => $qa->where('brand', 'like', "%{$brand}%"));
            })
            ->when($filters['model'] ?? null, function ($q, $model) {
                $q->whereHas('turnoverDisposalAssets.assets.assetModel', fn($qa) => $qa->where('model', 'like', "%{$model}%"));
            });
            

        return $query->paginate($perPage)->withQueryString();
    }

    public static function summaryCounts(): array
    {
        return [
            'total_turnovers' => static::where('type', 'turnover')->count(),
            'total_disposals' => static::where('type', 'disposal')->count(),
            'completed'       => static::where('status', 'completed')->count(),
            'pending_review'  => static::where('status', 'pending_review')->count(),
            'approved'        => static::where('status', 'approved')->count(),
            'rejected'        => static::where('status', 'rejected')->count(),
            'cancelled'       => static::where('status', 'cancelled')->count(),
        ];
    }

    public static function monthlyCompletedTrendData()
    {
        return DB::table('turnover_disposals as td')
            ->join('turnover_disposal_assets as tda', 'tda.turnover_disposal_id', '=', 'td.id')
            ->where('tda.asset_status', '=', 'completed') // ✅ Only completed assets
            ->selectRaw("
                DATE_FORMAT(td.document_date, '%Y-%m') as ym,
                SUM(CASE WHEN td.type = 'turnover' THEN 1 ELSE 0 END) as turnover,
                SUM(CASE WHEN td.type = 'disposal' THEN 1 ELSE 0 END) as disposal
            ")
            ->groupBy('ym')
            ->orderBy('ym')
            ->get()
            ->keyBy('ym');
    }

    public static function monthlyTrendData()
    {
        return static::selectRaw("
                DATE_FORMAT(document_date, '%Y-%m') as ym,
                SUM(CASE WHEN type = 'turnover' THEN 1 ELSE 0 END) as turnovers,
                SUM(CASE WHEN type = 'disposal' THEN 1 ELSE 0 END) as disposals
            ")
            ->groupBy('ym')
            ->orderBy('ym')
            ->get();
    }


}
