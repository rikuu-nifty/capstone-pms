<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
// use Illuminate\Database\Eloquent\SoftDeletes;

class TurnoverDisposal extends Model
{
    // use SoftDeletes;

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

    protected $casts = [
        'document_date' => 'date',
    ];

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
            ? $this->removeUnlinkedAssetsWithAudit($assetIds) //if less 
            : $this->removeUnlinkedAssetsBulk($assetIds); // more than 50 records

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
}
