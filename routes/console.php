<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ✅ Schedule your maintenance checker
Schedule::command('maintenance:check-due')->daily();

// ✅ Checks for overdue Transfers
Schedule::command('transfers:mark-overdue')->daily();

// ✅ Checks for overdue Off-Campus
Schedule::command('offcampus:mark-overdue')->daily();  // for deployment 

// Schedule::command('offcampus:mark-overdue')->everyMinute(); // for local testing //php artisan schedule:work 
                                                                                    //  php artisan schedule:run (for one shot testing)

