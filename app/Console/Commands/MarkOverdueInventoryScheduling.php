<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\InventoryScheduling;
use App\Models\User;
use App\Notifications\OverdueNotification;
use Carbon\Carbon;

class MarkOverdueInventoryScheduling extends Command
{
    protected $signature = 'inventory:mark-overdue';
    protected $description = 'Mark inventory schedulings as overdue if past actual_date_of_inventory and not completed/cancelled';

    public function handle()
    {
        $today = Carbon::today();

        $overdueSchedules = InventoryScheduling::whereDate('actual_date_of_inventory', '<', $today)
            ->whereNotIn('scheduling_status', ['Completed', 'Cancelled', 'Overdue'])
            ->get();

        // ✅ Include Super User, PMO Staff, PMO Head, and VP Admin
        $users = User::whereHas('role', function ($q) {
            $q->whereIn('code', ['superuser', 'pmo_staff', 'pmo_head', 'vp_admin']);
        })->get();

        foreach ($overdueSchedules as $schedule) {
            $schedule->update(['scheduling_status' => 'Overdue']);

            foreach ($users as $user) {
                $user->notify(new OverdueNotification(
                    "Inventory Scheduling #{$schedule->id} is overdue.",
                    $schedule->actual_date_of_inventory,
                    $schedule->id,
                    'inventory_scheduling'
                ));
            }
        }

        $this->info("{$overdueSchedules->count()} inventory schedulings marked as overdue and notifications sent.");
    }
}
