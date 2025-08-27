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

        InventoryList::whereIn('id', $assetIds)->update(['status' => 'archived']);
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


}
