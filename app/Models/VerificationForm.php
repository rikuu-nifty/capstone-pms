<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VerificationForm extends Model
{
    protected $fillable = [
        'unit_or_department_id',
        'requested_by_personnel_id',
        'requested_by_name',
        'requested_by_title',
        'requested_by_contact',

        'verified_by_id',
        'verified_at',
        'notes',
        'status',
        'remarks',
    ];

    protected $casts = [
        'verified_at' => 'date:Y-m-d',
    ];

    public function verificationAssets(): HasMany
    {
        return $this->hasMany(VerificationFormAsset::class);
    }

    public function unitOrDepartment(): BelongsTo
    {
        return $this->belongsTo(UnitOrDepartment::class, 'unit_or_department_id');
    }

    public function requestedByPersonnel(): BelongsTo
    {
        return $this->belongsTo(Personnel::class, 'requested_by_personnel_id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by_id');
    }

    public static function summaryTotals(): array
    {
        $now = now();
        return [
            'verified_this_month' => static::where('status', 'verified')
                ->whereMonth('verified_at', $now->month)
                ->whereYear('verified_at', $now->year)
                ->count(),
            'total_verified' => static::where('status', 'verified')->count(),
            'pending_verification' => static::where('status', 'pending')->count(),
        ];
    }

    public static function fetchPaginated(int $perPage = 10)
    {
        return static::with([
            'unitOrDepartment:id,name,code',
            'requestedByPersonnel:id,first_name,middle_name,last_name,unit_or_department_id,position',
            'verifiedBy:id,name',
        ])
            ->latest('created_at')
            ->paginate($perPage)
            ->through(function ($vf) {
                $person = $vf->requestedByPersonnel;
                $personName = $person
                    ? trim($person->first_name . ' ' . ($person->middle_name ? ($person->middle_name . ' ') : '') . $person->last_name)
                    : null;

                return [
                    'id'                     => $vf->id,
                    'created_at'             => $vf->created_at,
                    'verified_at'            => $vf->verified_at,
                    'verified_by'            => $vf->verifiedBy?->only(['id', 'name']),
                    'status'                 => $vf->status,
                    'notes'                  => $vf->notes,
                    'remarks'                => $vf->remarks,
                    'unit_or_department'     => $vf->unitOrDepartment?->only(['name', 'code']),
                    'requested_by_personnel' => $person ? [
                        'id'    => $person->id,
                        'name'  => $personName,
                        'title' => $person->position,
                    ] : null,
                    // snapshots (displayed if personnel is null or as authoritative record)
                    'requested_by_snapshot'  => [
                        'name'    => $vf->requested_by_name,
                        'title'   => $vf->requested_by_title,
                        'contact' => $vf->requested_by_contact,
                    ],
                ];
            });
    }
}
