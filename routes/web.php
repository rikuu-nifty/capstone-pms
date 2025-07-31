<?php

use App\Http\Controllers\InventoryListController;
use App\Http\Controllers\InventorySchedulingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('calendar', function () {
        return Inertia::render('calendar');
    })->name('calendar');

    // Route::resource('inventory-list', InventoryListController::class); // DEFAULT ROUTE
    // Route::resource('inventory-scheduling', InventorySchedulingController::class); // DEFAULT ROUTE

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





});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
