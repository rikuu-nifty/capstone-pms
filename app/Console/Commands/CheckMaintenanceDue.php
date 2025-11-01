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

        // ✅ Only fetch assets that haven't been notified
        $dueTodayAssets = InventoryList::whereDate('maintenance_due_date', $today)
            ->where('maintenance_notified', false)
            ->get();

        $overdueAssets = InventoryList::where('maintenance_due_date', '<', $now->toDateString())
            ->where('overdue_notified', false)
            ->get();

        if ($dueTodayAssets->isEmpty() && $overdueAssets->isEmpty()) {
            $this->info('No maintenance due or overdue today.');
            return;
        }

        // Only approved, active PMO Staff & Head
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

        foreach ($dueTodayAssets as $asset) {
            // 🧠 Double-check guard before sending
            if ($asset->maintenance_notified) continue;

            foreach ($users as $user) {
                $user->notify(new MaintenanceDueNotification($asset));
            }

            // 🟢 Mark immediately so next run will skip it
            $asset->updateQuietly(['maintenance_notified' => true]);
            $this->info("📨 Notified users for maintenance due asset: {$asset->asset_name}");
        }

        foreach ($overdueAssets as $asset) {
            if ($asset->overdue_notified) continue;

            foreach ($users as $user) {
                $user->notify(new OverdueNotification($asset));
            }

            $asset->updateQuietly(['overdue_notified' => true]);
            $this->info("📨 Notified users for overdue asset: {$asset->asset_name}");
        }

        $this->info("📢 Maintenance notifications processed successfully.");
    }
}
