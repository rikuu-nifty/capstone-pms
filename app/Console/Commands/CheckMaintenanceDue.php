<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\InventoryList;
use App\Models\User;
use App\Notifications\MaintenanceDueNotification;

class CheckMaintenanceDue extends Command
{
    /**
     * The name and signature of the console command.
     *
     * Run it manually with:
     *   php artisan maintenance:check-due
     */
    protected $signature = 'maintenance:check-due';

    /**
     * The console command description.
     */
    protected $description = 'Check for assets with maintenance due dates and notify PMO staff & head';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        // Find assets with due date today or already past
        $dueAssets = InventoryList::whereDate('maintenance_due_date', '<=', now())->get();

        if ($dueAssets->isEmpty()) {
            $this->info('✅ No maintenance due today.');
            return;
        }

        // Fetch only users with approved accounts and correct roles
        $users = User::without('role') // disables global eager loading
            ->where('status', 'approved')
            ->whereNotNull('role_id')
            ->whereHas('role', function ($q) {
                $q->whereIn('code', ['pmo_staff', 'pmo_head', 'superuser']);
            })
            ->with('role:id,code,name') // load fresh role data only for matched users
            ->get();

        // CONSOLE ONLY OUTPUT - php artisan maintenance:check-due
        // $this->info('🧾 Users fetched for notification:');
        // foreach ($users as $u) {
        //     $this->line("- {$u->name} [{$u->role?->code}]");
        // }

        if ($users->isEmpty()) {
            $this->warn('⚠️ No PMO Staff, PMO Head, or Superuser users found.');
            return;
        }

        // Strict filtered notifications
        foreach ($users as $user) {
            $user->loadMissing('role');
            $roleCode = strtolower($user->role?->code ?? '');

            if (!in_array($roleCode, ['pmo_staff', 'pmo_head', 'superuser'])) {
                continue; // Skip anyone else
            }

            foreach ($dueAssets as $asset) {
                $user->notify(new MaintenanceDueNotification($asset));
            }

            $this->info("📨 Notified {$user->name} ({$roleCode})");
        }

        $this->info("📢 Sent maintenance due notifications to {$users->count()} users.");
    }
}
