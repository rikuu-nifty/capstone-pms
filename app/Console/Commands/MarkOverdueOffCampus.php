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
    protected $description = 'Mark off-campus records as overdue if past or on return_date and fully approved.';

    public function handle()
    {
        $today = Carbon::now(config('app.timezone'))->startOfDay();

        // ✅ Only include approved and not yet returned/cancelled/overdue Off-Campus forms
        $overdueOffCampus = OffCampus::query()
            ->whereNotIn('status', ['returned', 'cancelled', 'overdue'])
            ->whereDate('return_date', '<=', $today)
            ->whereHas('formApproval', function ($q) {
                // ✅ Require BOTH external_approved_by (Dean/Head) and issued_by (PMO) steps approved
                $q->whereHas('steps', fn($s) =>
                    $s->where('code', 'external_approved_by')->where('status', 'approved')
                )->whereHas('steps', fn($s) =>
                    $s->where('code', 'issued_by')->where('status', 'approved')
                );
            })
            ->get();

        Log::info("🕒 [Overdue OffCampus] Found {$overdueOffCampus->count()} records due or past as of {$today->toDateString()}.");

        if ($overdueOffCampus->isEmpty()) {
            Log::info('✅ No Off-Campus records found overdue today.');
            $this->info('No Off-Campus records found overdue today.');
            return;
        }

        // ✅ Notify PMO Staff and PMO Head
        $users = User::whereHas('role', function ($q) {
            $q->whereIn('code', ['pmo_staff', 'pmo_head']);
        })->get();

        foreach ($overdueOffCampus as $record) {
            $record->update(['status' => 'overdue']);

            Log::info("🏷️ Marked Off-Campus #{$record->id} as Overdue (Return Date: {$record->return_date}).");

            foreach ($users as $user) {
                $user->notify(new OverdueNotification($record));
                Log::info("📨 Sent OverdueNotification to {$user->email} (Off-Campus #{$record->id}).");
            }
        }

        $this->info("{$overdueOffCampus->count()} off-campus records marked as overdue and notifications sent.");
    }
}
