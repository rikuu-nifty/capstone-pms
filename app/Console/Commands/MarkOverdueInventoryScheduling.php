<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\InventoryScheduling;
use App\Models\User;
use App\Notifications\OverdueNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class MarkOverdueInventoryScheduling extends Command
{
    protected $signature = 'inventory:mark-overdue';
    protected $description = 'Mark inventory schedulings as overdue if the actual_date_of_inventory is today or earlier and form is approved.';

    public function handle()
    {
        // ✅ Use your app timezone (e.g., Asia/Manila)
        $today = Carbon::now(config('app.timezone'))->startOfDay();

        // Fetch all schedulings that should now be marked as overdue
        $overdueSchedulings = InventoryScheduling::query()
            ->whereNotIn('scheduling_status', ['Completed', 'Cancelled', 'Overdue'])
            ->whereDate('actual_date_of_inventory', '<=', $today)
            ->whereHas('approvals', function ($q) {
                // Require BOTH noted_by and approved_by to be approved
                $q->whereHas('steps', fn($s) => 
                    $s->where('code', 'approved_by')->where('status', 'approved')
                )->whereHas('steps', fn($s) => 
                    $s->where('code', 'noted_by')->where('status', 'approved')
                );
            })
            ->get();

        Log::info("🕒 [Overdue Command] Found {$overdueSchedulings->count()} schedulings due or past as of {$today->toDateString()}.");

        if ($overdueSchedulings->isEmpty()) {
            $this->info('No overdue inventory schedulings found.');
            return;
        }

        // Notify PMO Staff and PMO Head
        $users = User::whereHas('role', function ($q) {
            $q->whereIn('code', ['pmo_staff', 'pmo_head']);
        })->get();

        foreach ($overdueSchedulings as $schedule) {
            $schedule->update(['scheduling_status' => 'Overdue']);

            Log::info("📦 Marked Inventory Scheduling #{$schedule->id} as Overdue.");

            foreach ($users as $user) {
                $user->notify(new OverdueNotification($schedule));
                Log::info("📨 Queued OverdueNotification for user {$user->email} (schedule #{$schedule->id}).");
            }
        }

        $this->info("{$overdueSchedulings->count()} inventory schedulings marked as overdue and notifications sent.");
    }
}
