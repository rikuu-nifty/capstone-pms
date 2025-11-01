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

        // ✅ Only get assets that haven't been notified yet
        $dueTodayAssets = InventoryList::whereDate('maintenance_due_date', $today)
            ->where('maintenance_notified', false)
            ->get();

        $overdueAssets = InventoryList::where('maintenance_due_date', '<', $today)
            ->where('overdue_notified', false)
            ->get();

        if ($dueTodayAssets->isEmpty() && $overdueAssets->isEmpty()) {
            $this->info('✅ No maintenance due or overdue today.');
            return;
        }

        // ✅ Only approved, active PMO Staff & Head (and Superuser for testing)
        $users = User::without('role')
            ->whereNull('deleted_at')
            ->where('status', 'approved')
            ->whereNotNull('role_id')
            ->whereHas('role', fn($q) => $q->whereIn('code', ['superuser', 'pmo_staff', 'pmo_head']))
            ->with('role:id,code,name')
            ->get();

        if ($users->isEmpty()) {
            $this->warn('⚠️ No active PMO Staff, PMO Head, or Superuser found.');
            return;
        }

        // ==========================
        // 🔔 Send Notifications
        // ==========================
        foreach ($users as $user) {
            $roleCode = strtolower($user->role?->code ?? '');

            // Maintenance due today
            foreach ($dueTodayAssets as $asset) {
                $user->notify(new MaintenanceDueNotification($asset));
            }

            // Maintenance already overdue
            foreach ($overdueAssets as $asset) {
                $user->notify(new OverdueNotification($asset));
            }

            $this->info("📨 Notified {$user->name} ({$roleCode})");
        }

        // ==========================
        // 🧩 Mark assets as notified
        // ==========================
        if ($dueTodayAssets->isNotEmpty()) {
            foreach ($dueTodayAssets as $asset) {
                $asset->updateQuietly(['maintenance_notified' => true]);
            }
            $this->info("✅ Marked {$dueTodayAssets->count()} due assets as notified.");
        }

        if ($overdueAssets->isNotEmpty()) {
            foreach ($overdueAssets as $asset) {
                $asset->updateQuietly(['overdue_notified' => true]);
            }
            $this->info("✅ Marked {$overdueAssets->count()} overdue assets as notified.");
        }

        // ==========================
        // 🧾 Summary
        // ==========================
        $this->info(
            "📢 Sent " .
            $dueTodayAssets->count() . " due and " .
            $overdueAssets->count() . " overdue notifications to " .
            $users->count() . " active users."
        );
    }
}
