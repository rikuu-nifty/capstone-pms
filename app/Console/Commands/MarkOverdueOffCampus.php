<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OffCampus;
use App\Models\User;
use App\Notifications\OverdueNotification;
use Carbon\Carbon;

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

        // ✅ Include Super User, PMO Staff, PMO Head, and VP Admin
        $users = User::whereHas('role', function ($q) {
            $q->whereIn('code', ['superuser', 'pmo_staff', 'pmo_head', 'vp_admin']);
        })->get();

        foreach ($overdueOffCampus as $record) {
            $record->update(['status' => 'overdue']);

            foreach ($users as $user) {
                $user->notify(new OverdueNotification(
                    "Off-Campus #{$record->id} is overdue.",
                    $record->return_date,
                    $record->id,
                    'off_campus'
                ));
            }
        }

        $this->info("{$overdueOffCampus->count()} off-campus records marked as overdue and notifications sent.");
    }
}
