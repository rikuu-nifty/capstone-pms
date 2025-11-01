<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
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
        $now = Carbon::now();
        $today = $now->toDateString();

        // ✅ Fetch only assets that haven’t been notified yet
        $dueTodayAssets = InventoryList::whereDate('maintenance_due_date', $today)
            ->where('maintenance_notified', false)
            ->get();

        $overdueAssets = InventoryList::where('maintenance_due_date', '<', $today)
            ->where('overdue_notified', false)
            ->get();

        if ($dueTodayAssets->isEmpty() && $overdueAssets->isEmpty()) {
            $this->info('No maintenance due or overdue today.');
            return;
        }

        // ✅ Active PMO Staff + Head + Superuser
        $users = User::without('role')
            ->whereNull('deleted_at')
            ->where('status', 'approved')
            ->whereNotNull('role_id')
            ->whereHas('role', fn($q) => $q->whereIn('code', ['superuser','pmo_staff','pmo_head']))
            ->with('role:id,code,name')
            ->get();

        if ($users->isEmpty()) {
            $this->warn('⚠️ No active PMO Staff or PMO Head users found.');
            return;
        }

        // ✅ Handle due-today assets
        foreach ($dueTodayAssets as $asset) {
            $asset->refresh();                                   // ensure fresh DB state
            if ($asset->maintenance_notified) continue;          // already processed

            $asset->forceFill(['maintenance_notified' => true])  // mark first
                  ->saveQuietly();

            foreach ($users as $user) {                          // then notify
                $user->notify(new MaintenanceDueNotification($asset));
            }

            $this->info("📨 Sent maintenance-due notice for: {$asset->asset_name}");
        }

        // ✅ Handle overdue assets
        foreach ($overdueAssets as $asset) {
            $asset->refresh();
            if ($asset->overdue_notified) continue;

            $asset->forceFill(['overdue_notified' => true])
                  ->saveQuietly();

            foreach ($users as $user) {
                $user->notify(new OverdueNotification($asset));
            }

            $this->info("📨 Sent overdue notice for: {$asset->asset_name}");
        }

        $this->info('✅ Maintenance notifications processed successfully.');
    }
}
