<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Transfer;
use App\Models\User;
use App\Notifications\OverdueNotification;
use Carbon\Carbon;

use Illuminate\Support\Facades\Log;

class MarkOverdueTransfers extends Command
{
    protected $signature = 'transfers:mark-overdue';
    protected $description = 'Mark transfers as overdue if past scheduled_date and not completed/cancelled';

    public function handle()
    {
        $today = Carbon::today();

        // Fetch all overdue transfers
        $overdueTransfers = Transfer::whereDate('scheduled_date', '<', $today)
            ->whereNotIn('status', ['completed', 'cancelled', 'overdue'])
            ->get();

        // Include Super User, PMO Staff, PMO Head, and VP Admin
        $users = User::whereHas('role', function ($q) {
            $q->whereIn('code', ['pmo_staff', 'pmo_head']);
        })->get();

        foreach ($overdueTransfers as $transfer) {
            $transfer->update(['status' => 'overdue']);

            Log::info("📦 Marked Transfer #{$transfer->id} as overdue and notifying users...");

            foreach ($users as $user) {
                $user->notify(new OverdueNotification($transfer));
            }
        }

        $this->info("{$overdueTransfers->count()} transfers marked as overdue and notifications sent.");
    }
}
