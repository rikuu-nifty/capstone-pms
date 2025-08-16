<?php

use App\Http\Controllers\AssetModelController;
use App\Http\Controllers\InventoryListController;
use App\Http\Controllers\InventorySchedulingController;
use App\Http\Controllers\BuildingController;
use App\Http\Controllers\TransferController;
use App\Http\Controllers\Auth\EmailOtpController;
use App\Http\Controllers\CategoryController;
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

    // REMOVE PUT PANGET DAW SABI NI MARK NOT RECOMMEND

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
    Route::get('/transfers', [TransferController::class, 'index'])->name('transfers.index');
    Route::post('/transfers', [TransferController::class, 'store'])->name('transfers.store');
    Route::put('/transfers/{transfer}', [TransferController::class, 'update'])->name('transfers.update');
    Route::get('/transfers/{transfer}/view', [TransferController::class, 'show'])->name('transfers.view');
    Route::delete('/transfers/{transfer}', [TransferController::class, 'destroy'])->name('transfers.destroy');

    // TURNOVER-DISPOSAL
    Route::get('/turnover-disposal', [TurnoverDisposalController::class, 'index'])->name('turnover-disposal.index');
    Route::post('/turnover-disposal', [TurnoverDisposalController::class, 'store'])->name('turnover-disposal.store');
    Route::put('/turnover-disposal/{turnoverDisposal}', [TurnoverDisposalController::class, 'update'])->name('turnover-disposal.update');
    Route::get('/turnover-disposal/{turnoverDisposal}/view', [TurnoverDisposalController::class, 'show'])->name('turnover-disposal.view');
    Route::delete('/turnover-disposal/{turnoverDisposal}', [TurnoverDisposalController::class, 'destroy'])->name('turnover-disposal.destroy');

    // BUILDINGS
    Route::get('/buildings', [BuildingController::class, 'index'])->name('buildings.index');
    Route::post('/buildings', [BuildingController::class, 'store'])->name('buildings.store');
    Route::put('/buildings/{building}', [BuildingController::class, 'update'])->name('buildings.update');
    Route::get('/buildings/view/{building}', [BuildingController::class, 'show'])->name('buildings.view');
    Route::delete('/buildings/{building}', [BuildingController::class, 'destroy'])->name('buildings.destroy');

    // CATEGORIES
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::get('/categories/view/{category}', [CategoryController::class, 'show'])->name('categories.view');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    //ASSET MODELS
    Route::get('/models', [AssetModelController::class, 'index'])->name('asset-models.index');
    Route::post('/models', [AssetModelController::class, 'store'])->name('asset-models.store');
    Route::put('/models/{assetModel}', [AssetModelController::class, 'update'])->name('asset-models.update');
    Route::get('/models/view/{assetModel}', [AssetModelController::class, 'show'])->name('asset-models.view');
    Route::delete('/models/{assetModel}', [AssetModelController::class, 'destroy'])->name('asset-models.destroy');


});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
