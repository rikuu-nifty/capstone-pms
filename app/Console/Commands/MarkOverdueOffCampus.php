<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OffCampus;
use App\Models\User;
use App\Notifications\OverdueNotification;
use Carbon\Carbon;

use Illuminate\Support\Facades\Log;

class MarkOverdueOffCampus extends Command
{
    protected $signature = 'offcampus:mark-overdue';
    protected $description = 'Mark off-campus records as overdue if past return_date and not returned/cancelled';

    public function handle()
    {
        $today = Carbon::today();

        $overdueOffCampus = OffCampus::whereDate('return_date', '<', $today)
            ->whereNotIn('status', ['returned', 'cancelled', 'overdue'])
            ->get();

        $users = User::whereHas('role', function ($q) {
            $q->whereIn('code', ['pmo_staff', 'pmo_head']);
        })->get();

        if ($overdueOffCampus->isEmpty()) {
            Log::info('✅ No Off-Campus records found overdue today.');
            $this->info('No Off-Campus records found overdue today.');
            return;
        }

        foreach ($overdueOffCampus as $record) {
            $record->update(['status' => 'overdue']);

            Log::info("🏷️ Marked Off-Campus #{$record->id} as overdue (Return Date: {$record->return_date}) — notifying users...");

            foreach ($users as $user) {
                Log::info("📩 Sending OverdueNotification to {$user->email} for Off-Campus #{$record->id}");
                $user->notify(new OverdueNotification($record));
            }
        }

        Log::info("📦 {$overdueOffCampus->count()} Off-Campus records marked as overdue and notifications dispatched.");
        $this->info("{$overdueOffCampus->count()} off-campus records marked as overdue and notifications sent.");
    }
}
