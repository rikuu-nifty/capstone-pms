<?php

    use Illuminate\Support\Facades\Route;
    use Inertia\Inertia;
    use Illuminate\Support\Facades\Auth;

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
    use App\Http\Controllers\DashboardController;
    use App\Http\Controllers\NotificationController;
    use App\Http\Controllers\ReportController;
    use App\Http\Controllers\Settings\PasswordController;
    use App\Http\Controllers\RoleController;


    // Route::get('/', function () {
    //     return Inertia::render('welcome');
    // })->name('home');

    Route::get('/', function () {
        if (Auth::check()) {
            return redirect()->route('dashboard'); // change to your actual dashboard route
        }
        return redirect()->route('login'); // send guests to login
    })->name('home');

    Route::get('/unauthorized', fn() => Inertia::render('errors/Unauthorized', [
        'message' => session('unauthorized'),
    ]))->name('unauthorized');

    Route::get('/approval-pending', function () {
        return Inertia::render('auth/ApprovalPending', [
            'message' => session('status') ?? 'Your account is awaiting admin approval.',
        ]);
    })->name('approval.pending');

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

    // // ✅ Public, no auth required
    // // Public Asset Summary (guest accessible via NFC scan)
    // Route::get('/asset-summary/{inventory_list}', [InventoryListController::class, 'publicSummary'])
    //     ->name('asset-summary.show');



    // 🔒 Everything below requires auth
    Route::middleware(['auth', 'verified', 'approved'])->group(function () {
    
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

Route::prefix('reports')->group(function () {
    Route::get('/', [ReportController::class, 'index'])->name('reports.index');

    Route::get('/inventory-list', [ReportController::class, 'inventoryList'])
        ->name('reports.inventory-list');

    // Placeholders with proper names
    Route::get('/inventory-scheduling', fn() =>
        Inertia::render('reports/InventorySchedulingReport', [
            'title' => 'Inventory Scheduling Report',
        ])
    )->name('reports.inventory-scheduling');

    Route::get('/transfer', fn() =>
        Inertia::render('reports/PropertyTransferReport', [
            'title' => 'Property Transfer Report',
        ])
    )->name('reports.transfer');

    Route::get('/turnover-disposal', fn() =>
        Inertia::render('reports/TurnoverDisposalReport', [
            'title' => 'Turnover/Disposal Report',
        ])
    )->name('reports.turnover-disposal');

    Route::get('/off-campus', fn() =>
        Inertia::render('reports/OffCampusReport', [
            'title' => 'Off-Campus Report',
        ])
    )->name('reports.off-campus');
});



    Route::get('calendar', function () {
        return Inertia::render('calendar');
    })->name('calendar');

    Route::get('/asset-summary/{inventory_list}', [InventoryListController::class, 'publicSummary'])
        ->name('asset-summary.show');
    
    //NOTIFICATIONS
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])
    ->name('notifications.markAllRead');

    Route::post('/notifications/{id}/mark-read', [NotificationController::class, 'markRead'])
    ->name('notifications.markRead');

    Route::post('/notifications/{id}/dismiss', [NotificationController::class, 'dismiss'])
    ->name('notifications.dismiss');

    //USER MANAGEMENT PAGE
    Route::get('/users', [UserApprovalController::class, 'index'])
        ->name('users.index')
        ->middleware('can:view-users-page');
    Route::post('/users/{user}/approve', [UserApprovalController::class, 'approve'])
        ->name('users.approve')
        ->middleware('can:approve-users');
    Route::post('/users/{user}/deny', [UserApprovalController::class, 'deny'])
        ->name('users.deny')
        ->middleware('can:approve-users');
    Route::post('/users/{user}/reset-password', [PasswordController::class, 'adminReset'])
        ->name('users.reset-password')
        ->middleware('can:reset-user-password');
    Route::post('/users/{user}/request-email-change', [UserApprovalController::class, 'requestEmailChange'])
        ->name('users.request-email-change')
        ->middleware('can:send-email-change-request');
    Route::delete('/users/{user}', [UserApprovalController::class, 'destroy'])
        ->name('users.destroy')
        ->middleware('can:delete-users,user');
    Route::post('/users/{user}/reassign-role', [UserApprovalController::class, 'reassignRole'])
        ->name('users.reassignRole')
        ->middleware('can:approve-users');

    //ROLES & PERMISSIONS
    Route::get('/role-management', [RoleController::class, 'index'])
        ->name('role-management.index')
        ->middleware('can:view-roles-page');
    Route::post('/role-management', [RoleController::class, 'store'])
        ->name('role-management.store')
        ->middleware('can:create-roles');
    Route::put('/role-management/{role}', [RoleController::class, 'update'])
        ->name('role-management.update')
        ->middleware('can:update-roles');
    Route::delete('/role-management/{role}', [RoleController::class, 'destroy'])
        ->name('role-management.destroy')
        ->middleware('can:delete-role,role');
    Route::put('/role-management/{role}/permissions', [RoleController::class, 'updatePermissions'])
        ->name('role-management.permissions.update')
        ->middleware('can:update-permissions');
        
    // INVENTORY-SCHEDULING
    Route::get('/inventory-scheduling', [InventorySchedulingController::class, 'index'])
        ->name('inventory-scheduling.index')
        ->middleware('can:view-inventory-scheduling');
    Route::post('/inventory-scheduling', [InventorySchedulingController::class, 'store'])
        ->name('inventory-scheduling.store')
        ->middleware('can:create-inventory-scheduling');
    Route::get('/inventory-scheduling/create', [InventorySchedulingController::class, 'create'])
        ->name('inventory-scheduling.create')
        ->middleware('can:create-inventory-scheduling');
    Route::get('/inventory-scheduling/{inventory_scheduling}/view', [InventorySchedulingController::class, 'show'])
        ->name('inventory-scheduling.view')
        ->middleware('can:view-inventory-scheduling');
    Route::put('/inventory-scheduling/{inventory_scheduling}', [InventorySchedulingController::class, 'update'])
        ->name('inventory-scheduling.update')
        ->middleware('can:update-inventory-scheduling');
    Route::get('/inventory-scheduling/{inventory_scheduling}/edit', [InventorySchedulingController::class, 'edit'])
        ->name('inventory-scheduling.edit')
        ->middleware('can:update-inventory-scheduling');
    Route::delete('/inventory-scheduling/{inventory_scheduling}', [InventorySchedulingController::class, 'destroy'])
        ->name('inventory-scheduling.destroy')
        ->middleware('can:delete-inventory-scheduling');
    
    // INVENTORY LIST
    Route::get('/inventory-list', [InventoryListController::class, 'index'])
        ->name('inventory-list.index')
        ->middleware('can:view-inventory-list');
    Route::get('/inventory-list', [InventoryListController::class, 'index'])
        ->name('inventory-list.index')
        ->middleware('can:view-own-unit-inventory-list');
    Route::post('/inventory-list', [InventoryListController::class, 'store'])
        ->name('inventory-list.store')
        ->middleware('can:create-inventory-list');
    // Route::get('/inventory-list/add-asset', [InventoryListController::class, 'create'])->name('inventory-list.create'); // renamed
    Route::get('/inventory-list/{inventory_list}', [InventoryListController::class, 'show'])
        ->name('inventory-list.show')
        ->middleware('can:view-inventory-list');
    Route::put('/inventory-list/{inventory_list}', [InventoryListController::class, 'update'])
        ->name('inventory-list.update')
        ->middleware('can:update-inventory-list');
    Route::get('/inventory-list/{inventory_list}/edit', [InventoryListController::class, 'edit'])
        ->name('inventory-list.edit')
        ->middleware('can:update-inventory-list');
    Route::delete('/inventory-list/{inventory_list}', [InventoryListController::class, 'destroy'])
        ->name('inventory-list.destroy')
        ->middleware('can:delete-inventory-list');
    Route::get('/inventory-list/{inventory_list}/view-asset-details', [InventoryListController::class, 'view'])
        ->name('inventory-list.view')
        ->middleware('can:view-inventory-list');

    // TRANSFERS
    Route::get('/transfers', [TransferController::class, 'index'])
        ->name('transfers.index')
        ->middleware('can:view-transfers');
    Route::post('/transfers', [TransferController::class, 'store'])
        ->name('transfers.store')
        ->middleware('can:create-transfers');
    Route::put('/transfers/{transfer}', [TransferController::class, 'update'])
        ->name('transfers.update')
        ->middleware('can:update-transfers');
    Route::get('/transfers/{id}/view', [TransferController::class, 'show'])
        ->name('transfers.view')
        ->middleware('can:view-transfers');
    Route::delete('/transfers/{transfer}', [TransferController::class, 'destroy'])
        ->name('transfers.destroy')
        ->middleware('can:delete-transfers');

    // TURNOVER / DISPOSAL
    Route::get('/turnover-disposal', [TurnoverDisposalController::class, 'index'])
        ->name('turnover-disposal.index')
        ->middleware('can:view-turnover-disposal');
    Route::post('/turnover-disposal', [TurnoverDisposalController::class, 'store'])
        ->name('turnover-disposal.store')
        ->middleware('can:create-turnover-disposal');
    Route::put('/turnover-disposal/{turnoverDisposal}', [TurnoverDisposalController::class, 'update'])
        ->name('turnover-disposal.update')
        ->middleware('can:update-turnover-disposal');
    Route::get('/turnover-disposal/{turnoverDisposal}/view', [TurnoverDisposalController::class, 'show'])
        ->name('turnover-disposal.view')
        ->middleware('can:view-turnover-disposal');
    Route::delete('/turnover-disposal/{turnoverDisposal}', [TurnoverDisposalController::class, 'destroy'])
        ->name('turnover-disposal.destroy')
        ->middleware('can:delete-turnover-disposal');

    /// OFF-CAMPUS
    Route::prefix('off-campus')->name('off-campus.')->group(function () {
        Route::get('/', [OffCampusController::class, 'index'])
            ->name('index')
            ->middleware('can:view-off-campus');
        Route::post('/', [OffCampusController::class, 'store'])
            ->name('store')
            ->middleware('can:create-off-campus');
        Route::get('/create', [OffCampusController::class, 'create'])
            ->name('create')
            ->middleware('can:create-off-campus');
        Route::get('/{off_campus}/view', [OffCampusController::class, 'show'])
            ->whereNumber('off_campus')
            ->name('view')
            ->middleware('can:view-off-campus');
        Route::put('/{off_campus}', [OffCampusController::class, 'update'])
            ->name('update')
            ->middleware('can:update-off-campus');
        Route::get('/{off_campus}/edit', [OffCampusController::class, 'edit'])
            ->name('edit')
            ->middleware('can:update-off-campus');
        Route::delete('/{offCampus}', [OffCampusController::class, 'destroy'])
            ->whereNumber('offCampus')
            ->name('destroy')
            ->middleware('can:delete-off-campus');
        Route::patch('/{id}/restore', [OffCampusController::class, 'restore'])
            ->whereNumber('id')
            ->name('restore')
            ->middleware('can:restore-off-campus');
        Route::delete('/{id}/force-delete', [OffCampusController::class, 'forceDelete'])
            ->whereNumber('id')
            ->name('forceDelete')
            ->middleware('can:delete-off-campus');
    });

    // BUILDINGS
    Route::get('/buildings', [BuildingController::class, 'index'])
        ->name('buildings.index')
        ->middleware('can:view-buildings');
    Route::get('/buildings', [BuildingController::class, 'index'])
        ->name('buildings.index')
        ->middleware('can:view-own-unit-buildings');
    Route::post('/buildings', [BuildingController::class, 'store'])
        ->name('buildings.store')
        ->middleware('can:create-buildings');
    Route::put('/buildings/{building}', [BuildingController::class, 'update'])
        ->name('buildings.update')
        ->middleware('can:update-buildings');
    Route::get('/buildings/view/{building}', [BuildingController::class, 'show'])
        ->name('buildings.view')
        ->middleware('can:view-buildings');
    Route::get('/buildings/view/{building}', [BuildingController::class, 'show'])
        ->name('buildings.view')
        ->middleware('can:view-own-unit-buildings');
    Route::delete('/buildings/{building}', [BuildingController::class, 'destroy'])
        ->name('buildings.destroy')
        ->middleware('can:delete-buildings');

    //BUILDING ROOMS
    Route::post('/building-rooms', [BuildingRoomController::class, 'store'])
        ->name('building-rooms.store')
        ->middleware('can:create-building-rooms');
    Route::put('/building-rooms/{buildingRoom}', [BuildingRoomController::class, 'update'])
        ->name('building-rooms.update')
        ->middleware('can:update-building-rooms');
    Route::delete('/building-rooms/{buildingRoom}', [BuildingRoomController::class, 'destroy'])
        ->name('building-rooms.destroy')
        ->middleware('can:delete-building-rooms');
    Route::get('/buildings/rooms/view/{buildingRoom}', [BuildingController::class, 'showRoom'])
        ->name('building-rooms.view')
        ->middleware('can:view-building-rooms');
    Route::get('/buildings/rooms/view/{buildingRoom}', [BuildingController::class, 'showRoom'])
        ->name('building-rooms.view')
        ->middleware('can:view-own-unit-buildings');

    // CATEGORIES
    Route::get('/categories', [CategoryController::class, 'index'])
        ->name('categories.index')
        ->middleware('can:view-categories');
    Route::post('/categories', [CategoryController::class, 'store'])
        ->name('categories.store')
        ->middleware('can:create-categories');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])
        ->name('categories.update')
        ->middleware('can:update-categories');
    Route::get('/categories/view/{category}', [CategoryController::class, 'show'])
        ->name('categories.view')
        ->middleware('can:view-categories');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
        ->name('categories.destroy')
        ->middleware('can:delete-categories');

    //ASSET MODELS
    Route::get('/models', [AssetModelController::class, 'index'])
        ->name('asset-models.index')
        ->middleware('can:view-asset-models');
    Route::post('/models', [AssetModelController::class, 'store'])
        ->name('asset-models.store')
        ->middleware('can:create-asset-models');
    Route::put('/models/{assetModel}', [AssetModelController::class, 'update'])
        ->name('asset-models.update')
        ->middleware('can:update-asset-models');
    Route::get('/models/view/{assetModel}', [AssetModelController::class, 'show'])
        ->name('asset-models.view')
        ->middleware('can:view-asset-models');
    Route::delete('/models/{assetModel}', [AssetModelController::class, 'destroy'])
        ->name('asset-models.destroy')
        ->middleware('can:delete-asset-models');

    // UNIT OR DEPARTMENTS
    Route::get('/unit-or-departments', [UnitOrDepartmentController::class, 'index'])
        ->name('unit_or_departments.index')
        ->middleware('can:view-unit-or-departments');
    Route::post('/unit-or-departments', [UnitOrDepartmentController::class, 'store'])
        ->name('unit_or_departments.store')
        ->middleware('can:create-unit-or-departments');
    Route::put('/unit-or-departments/{unit}', [UnitOrDepartmentController::class, 'update'])
        ->name('unit_or_departments.update')
        ->middleware('can:update-unit-or-departments');
    Route::get('/unit-or-departments/view/{unit}', [UnitOrDepartmentController::class, 'show'])
        ->name('unit_or_departments.view')
        ->middleware('can:view-unit-or-departments');
    Route::delete('/unit-or-departments/{unit}', [UnitOrDepartmentController::class, 'destroy'])
        ->name('unit_or_departments.destroy')
        ->middleware('can:delete-unit-or-departments');

    // FORM APPROVALS
    Route::get('/approvals', [FormApprovalController::class, 'index'])
        ->name('approvals.index')
        ->middleware('can:view-form-approvals');
    Route::post('/approvals/{approval}/approve', [FormApprovalController::class, 'approve'])
        ->name('approvals.approve')
        ->middleware('can:approve-form-approvals');
    Route::post('/approvals/{approval}/reject', [FormApprovalController::class, 'reject'])
        ->name('approvals.reject')
        ->middleware('can:approve-form-approvals');
    Route::post('/approvals/{approval}/reset', [FormApprovalController::class, 'reset'])
        ->name('approvals.reset')
        ->middleware('can:approve-form-approvals');
    Route::post('/approvals/{approval}/external-approve', [FormApprovalController::class, 'externalApprove'])
        ->name('approvals.external_approve')
        ->middleware('can:approve-form-approvals');


    //REPORTS

    //ASSIGNMENTS

    //PROFILE
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
