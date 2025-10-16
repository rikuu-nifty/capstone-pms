<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\InventoryScheduling;
use App\Models\User;
use App\Notifications\OverdueNotification;
use Illuminate\Support\Carbon;

class MarkOverdueInventoryScheduling extends Command
{
    protected $signature = 'inventory:mark-overdue';
    protected $description = 'Mark inventory schedulings as overdue if past actual_date_of_inventory and not completed/cancelled';

    public function handle()
    {
        $today = Carbon::today();

        $overdue = InventoryScheduling::query()
            ->whereNotIn('scheduling_status', ['Completed', 'Cancelled', 'Overdue'])
            ->whereRaw("LAST_DAY(STR_TO_DATE(CONCAT(inventory_schedule, '-01'), '%Y-%m-%d')) < ?", [$today])
            ->get();

        // Include Super User, PMO Staff, PMO Head, and VP Admin
        $users = User::whereHas('role', function ($q) {
            $q->whereIn('code', ['superuser', 'pmo_staff', 'pmo_head', 'vp_admin']);
        })->get();

        foreach ($overdue as $schedule) {
            $schedule->update(['scheduling_status' => 'Overdue']);

            foreach ($users as $user) {
                $user->notify(new OverdueNotification($schedule));
            }
        }

        $this->info("{$overdue->count()} inventory schedulings marked as Overdue and notifications queued.");
    }
}
