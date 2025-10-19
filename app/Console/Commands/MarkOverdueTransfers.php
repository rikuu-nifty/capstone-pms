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
    protected $description = 'Mark transfers as overdue if past or on scheduled_date and approved by PMO Head.';

    public function handle()
    {
        $today = Carbon::now(config('app.timezone'))->startOfDay();

        // ✅ Only include transfers approved by PMO Head (approved_by)
        $overdueTransfers = Transfer::query()
            ->whereNotIn('status', ['completed', 'cancelled', 'overdue'])
            ->whereDate('scheduled_date', '<=', $today)
            ->whereHas('formApproval', function ($q) {
                $q->whereHas('steps', fn($s) =>
                    $s->where('code', 'approved_by')->where('status', 'approved')
                );
            })
            ->get();

        Log::info("🕒 [Overdue Transfers] Found {$overdueTransfers->count()} transfers due or past as of {$today->toDateString()}.");

        if ($overdueTransfers->isEmpty()) {
            $this->info('No overdue transfers found.');
            return;
        }

        // ✅ Notify PMO Staff and PMO Head
        $users = User::whereHas('role', function ($q) {
            $q->whereIn('code', ['pmo_staff', 'pmo_head']);
        })->get();

        foreach ($overdueTransfers as $transfer) {
            $transfer->update(['status' => 'overdue']);

            Log::info("📦 Marked Transfer #{$transfer->id} as Overdue.");

            foreach ($users as $user) {
                $user->notify(new OverdueNotification($transfer));
                Log::info("📨 Sent OverdueNotification to {$user->email} (Transfer #{$transfer->id}).");
            }
        }

        $this->info("{$overdueTransfers->count()} transfers marked as overdue and notifications sent.");
    }
}
