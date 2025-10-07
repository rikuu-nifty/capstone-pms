<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ✅ Schedule your maintenance checker
Schedule::command('maintenance:check-due')->everyMinute();

// ✅ Checks for overdue Transfers
Schedule::command('transfers:mark-overdue')->everyMinute();

// Schedule::command('transfers:mark-overdue')->everyMinute();

// ✅ Checks for overdue Off-Campus
Schedule::command('offcampus:mark-overdue')->everyMinute();  // for deployment 

// ✅ Checks for overdue Inventory Scheduling
Schedule::command('inventory:mark-overdue')->everyMinute();  // for deployment

//  Schedule::command('inventory:mark-overdue')->everyMinute();
//  Schedule::command('offcampus:mark-overdue')->everyMinute(); // for local testing 
//  php artisan schedule:work 
//  php artisan schedule:run (for one shot testing)
