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
        // 1️⃣ Find assets with due date today or already past
        $dueAssets = InventoryList::whereDate('maintenance_due_date', '<=', now())->get();

        if ($dueAssets->isEmpty()) {
            $this->info('✅ No maintenance due today.');
            return;
        }

        // 2️⃣ Fetch users with PMO Staff + PMO Head roles
        $users = User::whereHas('role', function ($q) {
            $q->whereIn('code', ['pmo_staff', 'pmo_head', 'superuser']);
        })->get();

         if ($users->isEmpty()) {
            $this->warn('⚠️ No PMO Staff PMO Head and Superuser users found.');
            return;
        }

        // IF WANT MO KASAMA VP ADMIN UNCOMMENT MOTO
        // 2️⃣ Fetch users with PMO Staff + PMO Head + VP Admin + Superuser roles
        // $users = User::whereHas('role', function ($q) {
        //     $q->whereIn('code', ['pmo_staff', 'pmo_head', 'vp_admin', 'superuser']);
        //     })->get();

        //     if ($users->isEmpty()) {
        //         $this->warn('⚠️ No PMO Staff/PMO Head/VP Admin/Superuser users found.');
        //         return;
        //     }

       

        // 3️⃣ Send notifications
        foreach ($users as $user) {
            foreach ($dueAssets as $asset) {
                $user->notify(new MaintenanceDueNotification($asset));
            }
        }

        $this->info("📢 Sent maintenance due notifications to {$users->count()} users.");
    }
}
