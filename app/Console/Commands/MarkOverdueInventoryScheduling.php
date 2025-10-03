<?php

namespace App\Console\Commands;
    
use Illuminate\Console\Command;
use App\Models\InventoryScheduling;
use Carbon\Carbon;

class MarkOverdueInventoryScheduling extends Command
{
    protected $signature = 'inventory:mark-overdue';
    protected $description = 'Mark inventory schedulings as overdue if past actual_date_of_inventory and not completed/cancelled';

    public function handle()
    {
        $count = InventoryScheduling::whereDate('actual_date_of_inventory', '<', Carbon::today())
            ->whereNotIn('scheduling_status', ['Completed', 'Cancelled', 'Overdue'])
            ->update(['scheduling_status' => 'Overdue']);

        $this->info("{$count} inventory schedulings marked as overdue.");
    }
}
