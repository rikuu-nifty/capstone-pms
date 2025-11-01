<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\InventoryList;
use App\Models\User;
use App\Notifications\MaintenanceDueNotification;
use App\Notifications\OverdueNotification;
use Carbon\Carbon;

class CheckMaintenanceDue extends Command
{
    protected $signature = 'maintenance:check-due';
    protected $description = 'Check for assets with maintenance due dates and notify PMO staff & head';

    public function handle(): void
    {
        $today = Carbon::today()->toDateString();

        // 🔹 Get all active PMO users
        $users = User::query()
            ->whereNull('deleted_at')
            ->where('status', 'approved')
            ->whereHas('role', fn($q) => $q->whereIn('code', ['superuser', 'pmo_head', 'pmo_staff']))
            ->get();

        if ($users->isEmpty()) {
            $this->warn('⚠️ No active PMO Staff or PMO Head users found.');
            return;
        }

        // ============================================================
        // ✅ STEP 1: "DUE TODAY" - Update flags, then notify after commit
        // ============================================================
        $dueAssets = InventoryList::whereDate('maintenance_due_date', $today)
            ->where('maintenance_notified', false)
            ->get();

        if ($dueAssets->isNotEmpty()) {
            // Update all due assets first inside a transaction
            DB::transaction(function () use ($dueAssets) {
                foreach ($dueAssets as $asset) {
                    $asset->updateQuietly([
                        'maintenance_notified' => true,
                        'updated_at' => now(),
                    ]);
                }
            });

            // 🔸 Schedule notifications only AFTER commit
            DB::afterCommit(function () use ($dueAssets, $users) {
                foreach ($dueAssets as $asset) {
                    foreach ($users as $user) {
                        $user->notify(new MaintenanceDueNotification($asset));
                    }
                    info("📨 Maintenance due notice sent for: {$asset->asset_name}");
                }
            });
        }

        // ============================================================
        // ✅ STEP 2: "OVERDUE" - Same safe pattern
        // ============================================================
        $overdueAssets = InventoryList::where('maintenance_due_date', '<', $today)
            ->where('overdue_notified', false)
            ->get();

        if ($overdueAssets->isNotEmpty()) {
            DB::transaction(function () use ($overdueAssets) {
                foreach ($overdueAssets as $asset) {
                    $asset->updateQuietly([
                        'overdue_notified' => true,
                        'updated_at' => now(),
                    ]);
                }
            });

            DB::afterCommit(function () use ($overdueAssets, $users) {
                foreach ($overdueAssets as $asset) {
                    foreach ($users as $user) {
                        $user->notify(new OverdueNotification($asset));
                    }
                    info("📨 Overdue notice sent for: {$asset->asset_name}");
                }
            });
        }

        $this->info('✅ Maintenance notifications processed successfully.');
    }
}
