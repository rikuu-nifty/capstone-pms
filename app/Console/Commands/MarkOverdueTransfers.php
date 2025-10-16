<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Transfer;
use App\Models\User;
use App\Notifications\OverdueNotification;
use Carbon\Carbon;

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
            $q->whereIn('code', ['superuser', 'pmo_staff', 'pmo_head', 'vp_admin']);
        })->get();

        foreach ($overdueTransfers as $transfer) {
            $transfer->update(['status' => 'overdue']);

            foreach ($users as $user) {
                $user->notify(new OverdueNotification(
                    "Property Transfer #{$transfer->id} is overdue.",
                    $transfer->scheduled_date,
                    $transfer->id,
                    'property_transfer'
                ));
            }
        }

        $this->info("{$overdueTransfers->count()} transfers marked as overdue and notifications sent.");
    }
}
