<?php

    use Illuminate\Support\Facades\Route;
    use Inertia\Inertia;

    use App\Http\Controllers\AssetModelController;
    use App\Http\Controllers\InventoryListController;
    use App\Http\Controllers\InventorySchedulingController;
    use App\Http\Controllers\BuildingController;
    use App\Http\Controllers\BuildingRoomController;
    use App\Http\Controllers\TransferController;
    use App\Http\Controllers\Auth\EmailOtpController;
    use App\Http\Controllers\CategoryController;
    use App\Http\Controllers\TurnoverDisposalController;
    use App\Http\Controllers\OffCampusController;
    use App\Http\Controllers\UnitOrDepartmentController;
    use App\Http\Controllers\FormApprovalController;
    use App\Http\Controllers\UserApprovalController;


    Route::get('/', function () {
        return Inertia::render('welcome');
    })->name('home');

    Route::get('/approval-pending', function () {
        return Inertia::render('auth/ApprovalPending', [
            'message' => session('status') ?? 'Your account is awaiting admin approval.',
        ]);
    })->name('approval.pending');

    // USER APPROVAL
    Route::get('/user-approvals', [UserApprovalController::class, 'index'])->name('user-approvals.index');
    Route::post('/user-approvals/{user}/approve', [UserApprovalController::class, 'approve'])->name('user-approvals.approve');
    Route::post('/user-approvals/{user}/deny', [UserApprovalController::class, 'deny'])->name('user-approvals.deny');


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


    // ✅ Public, no auth required
    // Public Asset Summary (guest accessible via NFC scan)
Route::get('/asset-summary/{inventory_list}', [InventoryListController::class, 'publicSummary'])
    ->name('asset-summary.show');



    // 🔒 Everything below requires auth
Route::middleware(['auth', 'verified', 'approved'])->group(function () {
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

    // INVENTORY-LIST ORIGINAL
        Route::get('/inventory-list', [InventoryListController::class, 'index'])->name('inventory-list.index');
        Route::post('/inventory-list', [InventoryListController::class, 'store'])->name('inventory-list.store');
        // Route::get('/inventory-list/add-asset', [InventoryListController::class, 'create'])->name('inventory-list.create'); // renamed
        Route::get('/inventory-list/{inventory_list}', [InventoryListController::class, 'show'])->name('inventory-list.show');
        Route::put('/inventory-list/{inventory_list}', [InventoryListController::class, 'update'])->name('inventory-list.update');
        Route::get('/inventory-list/{inventory_list}/edit', [InventoryListController::class, 'edit'])->name('inventory-list.edit');
        Route::delete('/inventory-list/{inventory_list}', [InventoryListController::class, 'destroy'])->name('inventory-list.destroy');

        Route::get('/inventory-list/{inventory_list}/view-asset-details', [InventoryListController::class, 'view'])
            ->name('inventory-list.view');
    // INVENTORY-LIST 
    
    // INVENTORY-SCHEDULING
        Route::get('/inventory-scheduling', [InventorySchedulingController::class, 'index'])->name('inventory-scheduling.index');
        Route::post('/inventory-scheduling', [InventorySchedulingController::class, 'store'])->name('inventory-scheduling.store');
        Route::get('/inventory-scheduling/create', [InventorySchedulingController::class, 'create'])->name('inventory-scheduling.create');
        // Route::get('/inventory-scheduling/{inventory_scheduling}', [InventorySchedulingController::class, 'show'])->name('inventory-scheduling.show');
        Route::get('/inventory-scheduling/{inventory_scheduling}/view', [InventorySchedulingController::class, 'show'])
            ->name('inventory-scheduling.view');

        Route::put('/inventory-scheduling/{inventory_scheduling}', [InventorySchedulingController::class, 'update'])->name('inventory-scheduling.update');
        Route::get('/inventory-scheduling/{inventory_scheduling}/edit', [InventorySchedulingController::class, 'edit'])->name('inventory-scheduling.edit');
        Route::delete('/inventory-scheduling/{inventory_scheduling}', [InventorySchedulingController::class, 'destroy'])->name('inventory-scheduling.destroy');
    // INVENTORY-SCHEDULING

    // TRANSFERS
    Route::get('/transfers', [TransferController::class, 'index'])->name('transfers.index');
    Route::post('/transfers', [TransferController::class, 'store'])->name('transfers.store');
    Route::put('/transfers/{transfer}', [TransferController::class, 'update'])->name('transfers.update');
    // Route::get('/transfers/{transfer}/view', [TransferController::class, 'show'])->name('transfers.view');
    Route::get('/transfers/{id}/view', [TransferController::class, 'show'])->name('transfers.view');
    Route::delete('/transfers/{transfer}', [TransferController::class, 'destroy'])->name('transfers.destroy');

    // TURNOVER-DISPOSAL
    Route::get('/turnover-disposal', [TurnoverDisposalController::class, 'index'])->name('turnover-disposal.index');
    Route::post('/turnover-disposal', [TurnoverDisposalController::class, 'store'])->name('turnover-disposal.store');
    Route::put('/turnover-disposal/{turnoverDisposal}', [TurnoverDisposalController::class, 'update'])->name('turnover-disposal.update');
    Route::get('/turnover-disposal/{turnoverDisposal}/view', [TurnoverDisposalController::class, 'show'])->name('turnover-disposal.view');
    Route::delete('/turnover-disposal/{turnoverDisposal}', [TurnoverDisposalController::class, 'destroy'])->name('turnover-disposal.destroy');


    /// OFF-CAMPUS
    Route::prefix('off-campus')->name('off-campus.')->group(function () {
        Route::get('/', [OffCampusController::class, 'index'])->name('index');
        Route::post('/', [OffCampusController::class, 'store'])->name('store');
        Route::get('/create', [OffCampusController::class, 'create'])->name('create');
        // Route::get('/{off_campus}', [OffCampusController::class, 'show'])->name('show');
         Route::get('/{off_campus}/view', [OffCampusController::class, 'show'])
            ->whereNumber('off_campus')
            ->name('view');
        Route::put('/{off_campus}', [OffCampusController::class, 'update'])->name('update');
        Route::get('/{off_campus}/edit', [OffCampusController::class, 'edit'])->name('edit');

        // archive / restore / hard delete
        Route::delete('/{offCampus}', [OffCampusController::class, 'destroy'])
            ->whereNumber('offCampus')->name('destroy');

        Route::patch('/{id}/restore', [OffCampusController::class, 'restore'])
            ->whereNumber('id')->name('restore');

        Route::delete('/{id}/force-delete', [OffCampusController::class, 'forceDelete'])
            ->whereNumber('id')->name('forceDelete');
    });

    // BUILDINGS
    Route::get('/buildings', [BuildingController::class, 'index'])->name('buildings.index');
    Route::post('/buildings', [BuildingController::class, 'store'])->name('buildings.store');
    Route::put('/buildings/{building}', [BuildingController::class, 'update'])->name('buildings.update');
    Route::get('/buildings/view/{building}', [BuildingController::class, 'show'])->name('buildings.view');
    Route::delete('/buildings/{building}', [BuildingController::class, 'destroy'])->name('buildings.destroy');

    //BUILDING ROOMS
    Route::post('/building-rooms', [BuildingRoomController::class, 'store'])->name('building-rooms.store');
    Route::put('/building-rooms/{buildingRoom}', [BuildingRoomController::class, 'update'])->name('building-rooms.update');
    Route::delete('/building-rooms/{buildingRoom}', [BuildingRoomController::class, 'destroy'])->name('building-rooms.destroy');
    Route::get('/buildings/rooms/view/{buildingRoom}', [BuildingController::class, 'showRoom'])->name('building-rooms.view');

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

    // UNIT OR DEPARTMENTS
    Route::get('/unit-or-departments', [UnitOrDepartmentController::class, 'index'])->name('unit_or_departments.index');
    Route::post('/unit-or-departments', [UnitOrDepartmentController::class, 'store'])->name('unit_or_departments.store');
    Route::put('/unit-or-departments/{unit}', [UnitOrDepartmentController::class, 'update'])->name('unit_or_departments.update');
    Route::get('/unit-or-departments/view/{unit}', [UnitOrDepartmentController::class, 'show'])->name('unit_or_departments.view');
    Route::delete('/unit-or-departments/{unit}', [UnitOrDepartmentController::class, 'destroy'])->name('unit_or_departments.destroy');

    Route::middleware(['auth'])->group(function () {
        Route::get('/approvals', [FormApprovalController::class, 'index'])->name('approvals.index');

        Route::post('/approvals/{approval}/approve', [FormApprovalController::class, 'approve'])
            ->name('approvals.approve');
        Route::post('/approvals/{approval}/reject', [FormApprovalController::class, 'reject'])
            ->name('approvals.reject');
        Route::post('/approvals/{approval}/reset', [FormApprovalController::class, 'reset'])
            ->name('approvals.reset');    
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
