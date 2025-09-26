<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OffCampus;
use Carbon\Carbon;

class MarkOverdueOffCampus extends Command
{
    protected $signature = 'offcampus:mark-overdue';
    protected $description = 'Mark off-campus records as overdue if past return_date and not returned/cancelled';

    public function handle()
    {
        $count = OffCampus::whereDate('return_date', '<', Carbon::today())
            ->whereNotIn('status', ['returned', 'cancelled', 'overdue'])
            ->update(['status' => 'overdue']);

        $this->info("{$count} off-campus records marked as overdue.");
    }
}
