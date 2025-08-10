<?php

use App\Http\Controllers\InventoryListController;
use App\Http\Controllers\InventorySchedulingController;
use App\Http\Controllers\BuildingController;
use App\Http\Controllers\TransferController;
use App\Http\Controllers\Auth\EmailOtpController;
use App\Http\Controllers\TurnoverDisposalController;
use App\Models\TurnoverDisposal;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

//     // ----- Email OTP verification (must be logged in, but NOT necessarily verified) -----
//     Route::middleware('auth')->group(function () {
//     Route::get('/verify-email', [EmailOtpController::class, 'show'])->name('verification.notice');
//     Route::post('/verify-email/verify', [EmailOtpController::class, 'verify'])->name('verification.verify');
//     Route::post('/verify-email/resend', [EmailOtpController::class, 'resend'])->middleware('throttle:60,1')->name('verification.resend');
// });

// // Email OTP verification (must be logged in, but not verified yet)
//     Route::middleware('auth')->group(function () {
//     Route::get('/verify-email-otp', [EmailOtpController::class, 'show'])->name('verification.notice');
//     Route::post('/verify-email-otp/verify', [EmailOtpController::class, 'verify'])->name('verification.verify');
//     Route::post('/verify-email-otp/resend', [EmailOtpController::class, 'resend'])
//         ->middleware('throttle:60,1')
//         ->name('verification.resend');
// });

// OTP flow (guest; uses a session key, not auth)
Route::middleware('guest')->group(function () {
    Route::get('/verify-email-otp',    [EmailOtpController::class, 'showGuest'])->name('otp.notice');
    Route::post('/verify-email-otp/verify',  [EmailOtpController::class, 'verifyGuest'])->name('otp.verify');
    Route::post('/verify-email-otp/resend',  [EmailOtpController::class, 'resendGuest'])->name('otp.resend');
});



Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('calendar', function () {
        return Inertia::render('calendar');
    })->name('calendar');

    // Route::resource('inventory-list', InventoryListController::class); // DEFAULT ROUTE
    // Route::resource('inventory-scheduling', InventorySchedulingController::class); // DEFAULT ROUTE
    // Route::resource('buildings', BuildingController::class);

    // INVENTORY-LIST
        Route::get('/inventory-list', [InventoryListController::class, 'index'])->name('inventory-list.index');
        Route::post('/inventory-list', [InventoryListController::class, 'store'])->name('inventory-list.store');
        // Route::get('/inventory-list/add-asset', [InventoryListController::class, 'create'])->name('inventory-list.create'); // renamed
        Route::get('/inventory-list/{inventory_list}', [InventoryListController::class, 'show'])->name('inventory-list.show');
        Route::put('/inventory-list/{inventory_list}', [InventoryListController::class, 'update'])->name('inventory-list.update');
        Route::get('/inventory-list/{inventory_list}/edit', [InventoryListController::class, 'edit'])->name('inventory-list.edit');
        Route::delete('/inventory-list/{inventory_list}', [InventoryListController::class, 'destroy'])->name('inventory-list.destroy');
    // INVENTORY-LIST 

    // INVENTORY-SCHEDULING
        Route::get('/inventory-scheduling', [InventorySchedulingController::class, 'index'])->name('inventory-scheduling.index');
        Route::post('/inventory-scheduling', [InventorySchedulingController::class, 'store'])->name('inventory-scheduling.store');
        Route::get('/inventory-scheduling/create', [InventorySchedulingController::class, 'create'])->name('inventory-scheduling.create');
        Route::get('/inventory-scheduling/{inventory_scheduling}', [InventorySchedulingController::class, 'show'])->name('inventory-scheduling.show');
        Route::put('/inventory-scheduling/{inventory_scheduling}', [InventorySchedulingController::class, 'update'])->name('inventory-scheduling.update');
        Route::get('/inventory-scheduling/{inventory_scheduling}/edit', [InventorySchedulingController::class, 'edit'])->name('inventory-scheduling.edit');
        Route::delete('/inventory-scheduling/{inventory_scheduling}', [InventorySchedulingController::class, 'destroy'])->name('inventory-scheduling.destroy');
    // INVENTORY-SCHEDULING

    // TRANSFERS
    Route::get('/transfers', [TransferController::class, 'index'])->name('transfer.index');
    Route::post('/transfers', [TransferController::class, 'store'])->name('transfer.store');
    Route::put('/transfers/{transfer}', [TransferController::class, 'update'])->name('transfers.update');
    Route::get('/transfers/{transfer}/view', [TransferController::class, 'show'])->name('transfers.view');
    Route::delete('/transfers/{transfer}', [TransferController::class, 'destroy'])->name('transfer.destroy');

    // TURNOVER-DISPOSAL
    Route::get('/turnover-disposal', [TurnoverDisposalController::class, 'index'])->name('turnover-disposal.index');
    
    // INSTITUTIONAL SETUP - BUILDINGS
    Route::get('/buildings', [BuildingController::class, 'index'])->name('buildings.index');
    




});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
