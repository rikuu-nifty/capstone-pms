<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerificationForm extends Model
{
    protected $fillable = [
        'turnover_disposal_id',
        'verified_by_id',
        'verified_at',
        'notes',
        'status',
    ];

    protected $casts = [
        'verified_at' => 'date:Y-m-d',
    ];

    /* Relations */
    public function turnoverDisposal(): BelongsTo
    {
        return $this->belongsTo(TurnoverDisposal::class);
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

    public static function fetchPaginated(int $perPage = 20)
    {
        return static::with(['turnoverDisposal.issuingOffice:id,name,code'])
            ->latest('verified_at')
            ->paginate($perPage)
            ->through(function ($vf) {
                return [
                    'id' => $vf->id,
                    'document_date' => $vf->verified_at ?? $vf->created_at,
                    'status' => $vf->status,
                    'notes' => $vf->notes,
                    'issuing_office' => $vf->turnoverDisposal?->issuingOffice?->only(['name', 'code']),
                    'form_approval' => [
                        'reviewed_at' => $vf->verified_at,
                    ],
                ];
            });
    }
}
