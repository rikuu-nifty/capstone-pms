<?php

namespace App\Support;

use App\Models\InventorySchedulingSignatory;
use App\Models\OffCampusSignatory;
use App\Models\Role;
use App\Models\TransferSignatory;
use App\Models\TurnoverDisposalSignatory;
use App\Models\User;
use Illuminate\Support\Collection;

class SignatorySnapshot
{
    public static function capture(string $moduleType): array
    {
        return self::live($moduleType)
            ->map(fn ($signatory) => [
                'name' => $signatory->name ?? null,
                'title' => $signatory->title ?? null,
            ])
            ->toArray();
    }

    public static function forForm(?array $snapshot, string $moduleType): Collection
    {
        if (!empty($snapshot)) {
            return collect($snapshot)->map(fn ($signatory) => (object) [
                'name' => $signatory['name'] ?? null,
                'title' => $signatory['title'] ?? null,
            ]);
        }

        return self::live($moduleType);
    }

    public static function live(string $moduleType): Collection
    {
        return match ($moduleType) {
            'inventory_scheduling' => InventorySchedulingSignatory::all()->keyBy('role_key'),
            'property_transfer' => TransferSignatory::all()->keyBy('role_key'),
            'turnover_disposal' => TurnoverDisposalSignatory::all()->keyBy('role_key'),
            'off_campus' => self::offCampusLive(),
            default => collect(),
        };
    }

    private static function offCampusLive(): Collection
    {
        $signatories = OffCampusSignatory::all()->keyBy('role_key');

        if (!$signatories->has('issued_by')) {
            $pmoHeadRoleId = Role::where('code', 'pmo_head')->value('id');
            $pmoHead = $pmoHeadRoleId
                ? User::where('role_id', $pmoHeadRoleId)->where('status', 'approved')->first()
                : null;

            $signatories->put('issued_by', (object) [
                'name' => $pmoHead?->name,
                'title' => 'Head, PMO',
            ]);
        }

        return $signatories;
    }
}
