<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Transfer;
use Carbon\Carbon;

class MarkOverdueTransfers extends Command
{
    protected $signature = 'transfers:mark-overdue';
    protected $description = 'Mark transfers as overdue if past scheduled_date and not completed/cancelled';

    public function handle()
    {
        $count = Transfer::whereDate('scheduled_date', '<', Carbon::today())
            ->whereNotIn('status', ['completed', 'cancelled', 'overdue'])
            ->update(['status' => 'overdue']);

        $this->info("{$count} transfers marked as overdue.");
    }
}
