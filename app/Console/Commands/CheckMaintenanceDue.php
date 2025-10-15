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
        $today = Carbon::today();

        $dueTodayAssets = InventoryList::whereDate('maintenance_due_date', $today)->get();
        $overdueAssets  = InventoryList::whereDate('maintenance_due_date', '<', $today)->get();

        if ($dueTodayAssets->isEmpty() && $overdueAssets->isEmpty()) {
            $this->info('✅ No maintenance due or overdue today.');
            return;
        }

        $users = User::without('role') // disables global eager loading
            ->where('status', 'approved')
            ->whereNotNull('role_id')
            ->whereHas('role', function ($q) {
                $q->whereIn('code', ['pmo_staff', 'pmo_head']);
            })
            ->with('role:id,code,name') // load fresh role data only for matched users
            ->get();

        if ($users->isEmpty()) {
            $this->warn('⚠️ No PMO Head or PMO Staff users found.');
            return;
        }

        foreach ($users as $user) {
            $roleCode = strtolower($user->role?->code ?? '');

            // Notify for assets DUE TODAY
            foreach ($dueTodayAssets as $asset) {
                $user->notify(new MaintenanceDueNotification($asset));
            }

            // Notify for assets ALREADY OVERDUE
            foreach ($overdueAssets as $asset) {
                $user->notify(new OverdueNotification($asset));
            }

            $this->info("📨 Notified {$user->name} ({$roleCode})");
        }

        $this->info(
            "📢 Sent " .
                $dueTodayAssets->count() . " due and " .
                $overdueAssets->count() . " overdue notifications to {$users->count()} users."
        );
    }
}
