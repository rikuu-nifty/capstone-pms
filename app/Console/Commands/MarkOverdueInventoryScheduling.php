<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\InventoryScheduling;
use App\Models\User;
use App\Notifications\OverdueNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class MarkOverdueInventoryScheduling extends Command
{
    protected $signature = 'inventory:mark-overdue';
    protected $description = 'Mark inventory schedulings as Overdue if the scheduled month has passed and form is approved.';

    public function handle()
    {
        $today = Carbon::today();

        // Only include approved forms (Fully Approved)
        $overdue = InventoryScheduling::query()
            ->whereNotIn('scheduling_status', ['Completed', 'Cancelled', 'Overdue'])
            ->whereRaw("STR_TO_DATE(CONCAT(inventory_schedule, '-01'), '%Y-%m-%d') < ?", [$today])
            ->whereHas('approvals', function ($q) {
                // Require BOTH noted_by and approved_by to be approved
                $q->whereHas('steps', fn($s) => $s->where('code', 'approved_by')->where('status', 'approved'))
                    ->whereHas('steps', fn($s) => $s->where('code', 'noted_by')->where('status', 'approved'));
            })
            ->get();

        Log::info("🕒 [Overdue Command] Found {$overdue->count()} schedulings potentially overdue.");

        if ($overdue->isEmpty()) {
            $this->info('No overdue schedulings found.');
            return;
        }

        $users = User::whereHas('role', function ($q) {
            $q->whereIn('code', ['pmo_staff', 'pmo_head']);
        })->get();

        Log::info("🕒 [Overdue Command] Notifying {$users->count()} users.");

        foreach ($overdue as $schedule) {
            $schedule->update(['scheduling_status' => 'Overdue']);
            Log::info("📦 Marked scheduling #{$schedule->id} as Overdue.");

            foreach ($users as $user) {
                $user->notify(new OverdueNotification($schedule));
                Log::info("📨 Queued OverdueNotification for user {$user->email} (schedule #{$schedule->id}).");
            }
        }

        $this->info("{$overdue->count()} inventory schedulings marked as Overdue and notifications queued.");
    }
}
