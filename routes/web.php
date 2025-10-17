<?php

    use Illuminate\Support\Facades\Route;
    use Inertia\Inertia;
    use Illuminate\Support\Facades\Auth;
    use App\Http\Controllers\Auth\AuthenticatedSessionController;

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
    use App\Http\Controllers\InventorySheetReportController;
    use App\Http\Controllers\InventorySchedulingReportController;
    use App\Http\Controllers\PropertyTransferReportController;
    use App\Http\Controllers\OffCampusReportController;
    use App\Http\Controllers\AuditTrailController;
    use App\Http\Controllers\PersonnelController;
    use App\Http\Controllers\AssetAssignmentController;
    use App\Http\Controllers\TurnoverDisposalReportController;
    use App\Http\Controllers\EquipmentCodeController;
    use App\Http\Controllers\InventorySchedulingSignatoryController;
    use App\Http\Controllers\TransferSignatoryController;
    use App\Http\Controllers\SignatoryController;
    use App\Http\Controllers\TrashBinController;
    use App\Http\Controllers\Settings\ProfileController;
    use App\Http\Controllers\CalendarController;

    Route::get('/', function () {
        if (Auth::check()) {
            return redirect()->route('dashboard'); // change to your actual dashboard route
        }
        return redirect()->route('login'); // send guests to login
    })->name('home');

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    Route::get('/force-logout', function () {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();

        return redirect()->route('login')->with('status', 'You have been logged out.');
    })->name('force.logout');

Route::get('/unauthorized', fn() => Inertia::render('errors/Unauthorized', [
        'message' => session('unauthorized'),
    ]))->name('unauthorized');

    Route::get('/approval-pending', function () {
        return Inertia::render('auth/ApprovalPending', [
            'message' => session('status') ?? 'Your account is awaiting admin approval.',
        ]);
    })->name('approval.pending');

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

    // AUDIT-TRAIL
    Route::get('/audit-log', [AuditTrailController::class, 'index'])
    ->name('audit-trail.index');
    
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::prefix('reports')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('reports.index');

        // Asset Inventory List Report
        Route::get('/assets-inventory-list', [ReportController::class, 'inventoryList'])
            ->name('reports.inventory-list');

        // Export to PDF
        Route::get('/assets-inventory-list/export/pdf', [ReportController::class, 'exportPdf'])
            ->name('reports.inventory-list.export.pdf');

        // Export to Excel
        Route::get('/assets-inventory-list/export/excel', [ReportController::class, 'exportExcel'])
            ->name('reports.inventory-list.export.excel');  

        // Inventory Scheduling Report
        Route::get('/inventory-scheduling', [InventorySchedulingReportController::class, 'index'])
            ->name('reports.inventory-scheduling');

        // Export to PDF
        Route::get('/reports/inventory-scheduling/export/pdf', [InventorySchedulingReportController::class, 'exportPdf'])
            ->name('reports.inventory-scheduling.export.pdf');

        // Export to Excel
        Route::get('/reports/inventory-scheduling/export/excel', [InventorySchedulingReportController::class, 'exportExcel'])
        ->name('reports.inventory-scheduling.export.excel');

        // Property Transfer Report
        Route::get('/transfer', [PropertyTransferReportController::class, 'index'])
            ->name('reports.transfer');

        // Export to PDF
        Route::get('/transfer/export/pdf', [PropertyTransferReportController::class, 'exportPdf'])
            ->name('reports.transfer.export.pdf');

        // Export to Excel
        Route::get('/transfer/export/excel', [PropertyTransferReportController::class, 'exportExcel'])
            ->name('reports.transfer.export.excel');

        // Off-Campus Report
        Route::get('/off-campus', [OffCampusReportController::class, 'index'])
            ->name('reports.off-campus');

        // Export to PDF
        Route::get('/off-campus/export/pdf', [OffCampusReportController::class, 'exportPdf'])
            ->name('reports.off-campus.export.pdf');

        // Export to Excel 
        Route::get('/off-campus/export/excel', [OffCampusReportController::class, 'exportExcel'])
            ->name('reports.off-campus.export.excel');

        Route::get('/inventory-sheet', [InventorySheetReportController::class, 'index'])
            ->name('reports.inventory-sheet');
        Route::post('/inventory-sheet/generate', [InventorySheetReportController::class, 'generate'])
            ->name('reports.inventory-sheet.generate');
        Route::get('/inventory-sheet/export/pdf', [InventorySheetReportController::class, 'exportPdf'])
            ->name('reports.inventory-sheet.export.pdf');
        Route::get('/inventory-sheet/export/excel', [InventorySheetReportController::class, 'exportExcel'])
            ->name('reports.inventory-sheet.export.excel');

        // Turnover / Disposal Report
        Route::get('/turnover-disposal', [TurnoverDisposalReportController::class, 'index']) ->name('reports.turnover-disposal');
        Route::get('/turnover-disposal/export/pdf', [TurnoverDisposalReportController::class, 'exportPdf'])->name('reports.turnover-disposal.export.pdf');
        Route::get('/turnover-disposal/export/excel', [TurnoverDisposalReportController::class, 'exportExcel'])->name('reports.turnover-disposal.export.excel');

        Route::get('reports/turnover-disposal/export/donations/pdf', [TurnoverDisposalReportController::class, 'exportDonationPdf'])->name('reports.turnover-disposal.export.donations.pdf');
        Route::get('/reports/turnover-disposal/export/donations/excel', [TurnoverDisposalReportController::class, 'exportDonationExcel'])
            ->name('reports.turnover-disposal.export.donations.excel');
    });

    // Unified Signatories Management
    Route::prefix('signatories')->group(function () {
        Route::get('/', [SignatoryController::class, 'index'])->name('signatories.index');
        Route::post('/', [SignatoryController::class, 'store'])->name('signatories.store');
        Route::put('/{signatory}', [SignatoryController::class, 'update'])->name('signatories.update');
        Route::delete('/{signatory}', [SignatoryController::class, 'destroy'])->name('signatories.destroy');
    });

    Route::get('/calendar', [CalendarController::class, 'index'])
        ->name('calendar')
        ->middleware('can:view-calendar');

    Route::get('/asset-summary/{inventory_list}', [InventoryListController::class, 'publicSummary'])
        ->name('asset-summary.show');
    
    // NOTIFICATIONS
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index')
            ->middleware('can:view-notifications');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllRead'])->name('markAllRead')
            ->middleware('can:update-notifications');
        Route::post('/{notification}/read', [NotificationController::class, 'markRead'])->name('read')
            ->middleware('can:update-notifications');
        Route::post('/{notification}/unread', [NotificationController::class, 'markUnread'])->name('unread')
            ->middleware('can:update-notifications');
        Route::post('/{notification}/dismiss', [NotificationController::class, 'dismiss'])->name('dismiss')
            ->middleware('can:update-notifications');
        Route::post('/{notification}/archive', [NotificationController::class, 'archive'])->name('archive')
            ->middleware('can:archive-notifications');
        Route::delete('/{notification}', [NotificationController::class, 'destroy'])->name('destroy')
            ->middleware('can:delete-notifications');
    });

    // // Mark all as read
    // Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])
    //     ->name('notifications.markAllRead');
    // // Mark single as read
    // Route::post('/notifications/{notification}/mark-read', [NotificationController::class, 'markRead'])
    //     ->name('notifications.markRead');
    // // Dismiss (like remove from dropdown, but keep in DB as archived)
    // Route::post('/notifications/{notification}/dismiss', [NotificationController::class, 'dismiss'])
    //     ->name('notifications.dismiss');
    // // Archive (for the dedicated page)
    // Route::post('/notifications/{notification}/archive', [NotificationController::class, 'archive'])
    //     ->name('notifications.archive');
    // // Delete permanently
    // Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])
    //     ->name('notifications.destroy');

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
    Route::get('/users/{user}', [UserApprovalController::class, 'show'])->name('users.show')
        ->middleware('can:view-users-page');

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
        
    // INVENTORY SCHEDULING
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
    Route::get('/schedules/{schedule}/rows/{row}/assets', [InventorySchedulingController::class, 'rowAssets'])
        ->name('schedules.rowAssets');
    Route::put('/schedules/{schedule}/rows/{row}/bulk-status', [InventorySchedulingController::class, 'bulkUpdateAssetStatus'])
        ->name('schedules.bulkUpdateAssetStatus');
    Route::put('/schedules/{schedule}/assets/{asset}', [InventorySchedulingController::class, 'updateAssetStatus'])
        ->name('schedules.updateAssetStatus');
    Route::get('/inventory-scheduling/{id}/export-pdf', [InventorySchedulingController::class, 'exportPdf'])
        ->name('inventory-scheduling.export-pdf');


    // INVENTORY LIST
    Route::get('/inventory-list', [InventoryListController::class, 'index'])
        ->name('inventory-list.index')
        ->middleware('can:view-inventory-list');
    Route::get('/inventory-list/own', [InventoryListController::class, 'ownUnitIndex'])
        ->name('inventory-list.own')
        ->middleware('can:view-own-unit-inventory-list');
    Route::post('/inventory-list', [InventoryListController::class, 'store'])
        ->name('inventory-list.store')
        ->middleware('can:create-inventory-list');
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
    Route::get('/inventory-list/own/{inventory_list}/view-asset-details', [InventoryListController::class, 'ownUnitView'])
        ->name('inventory-list.own.view')
        ->middleware('can:view-own-unit-inventory-list');

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
    Route::get('/transfers/{id}/print', [TransferController::class, 'exportPdf'])
    ->name('transfers.print');

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
    Route::get('/turnover-disposal/{id}/print', [TurnoverDisposalController::class, 'exportPdf'])
        ->name('turnover-disposal.print');

    /// OFF CAMPUS
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
    Route::get('/off-campus/{id}/print', [OffCampusController::class, 'exportPdf'])
        ->name('off-campus.print');

    // BUILDINGS
    Route::get('/buildings', [BuildingController::class, 'index'])
        ->name('buildings.index')
        ->middleware('can:view-buildings');
    Route::get('/buildings/own', [BuildingController::class, 'ownUnitIndex'])
        ->name('buildings.own.unit.index')
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
    Route::get('/buildings/own/view/{building}', [BuildingController::class, 'show'])
        ->name('buildings.own.view')
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
    Route::delete('/sub-areas/{subArea}', [BuildingRoomController::class, 'destroySubArea'])
        ->name('sub-areas.destroy')
        ->middleware('can:delete-building-rooms');
    Route::get('/buildings/rooms/view/{buildingRoom}', [BuildingController::class, 'showRoom'])
        ->name('building-rooms.view')
        ->middleware('can:view-building-rooms');
    Route::get('/buildings/own/rooms/view/{buildingRoom}', [BuildingController::class, 'showRoom'])
        ->name('building-rooms.own.view')
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
        ->middleware('can:reset-form-approvals');
    Route::post('/approvals/{approval}/external-approve', [FormApprovalController::class, 'externalApprove'])
        ->name('approvals.external_approve')
        ->middleware('can:approve-form-approvals');
    Route::delete('/approvals/{approval}', [FormApprovalController::class, 'destroy'])->name('approvals.destroy')
        ->middleware('can:delete-form-approvals');

    // PERSONNELS
    Route::get('/personnels', [PersonnelController::class, 'index'])->name('personnels.index')
        ->middleware('can:view-personnels');
    Route::post('/personnels', [PersonnelController::class, 'store'])->name('personnels.store')
        ->middleware('can:create-personnels');
    Route::put('/personnels/{personnel}', [PersonnelController::class, 'update'])->name('personnels.update')
        ->middleware('can:update-personnels');
    Route::get('/personnels/view/{personnel}', [PersonnelController::class, 'show'])->name('personnels.view')
        ->middleware('can:view-personnels');
    Route::delete('/personnels/{personnel}', [PersonnelController::class, 'destroy'])->name('personnels.destroy')
        ->middleware('can:delete-personnels');

    // ASSIGNMENTS
    Route::get('/assignments', [AssetAssignmentController::class, 'index'])->name('assignments.index')
        ->middleware('can:view-assignments');
    Route::post('/assignments', [AssetAssignmentController::class, 'store'])->name('assignments.store')
        ->middleware('can:create-assignments');
    Route::put('/assignments/{assignment}', [AssetAssignmentController::class, 'update'])->name('assignments.update')
        ->middleware('can:update-assignments');
    Route::get('/assignments/{assignment}', [AssetAssignmentController::class, 'show'])->name('assignments.show')
        ->middleware('can:view-assignments');
    Route::delete('/assignments/{assignment}', [AssetAssignmentController::class, 'destroy'])->name('assignments.destroy')
        ->middleware('can:delete-assignments');
    Route::get('/inventory-list/{inventory_list}/json', [InventoryListController::class, 'fetch']) //this is for seeing the asset
        ->name('inventory-list.fetch'); 
    Route::delete('/assignments/items/{item}/unassign', [AssetAssignmentController::class, 'unassignItem'])
        ->name('assignments.items.unassign')
        ->middleware('can:update-assignments');

    // ASSET REASSIGNMENTS
    Route::get('/assignments/personnel/{personnel}/assets', [AssetAssignmentController::class, 'personnelAssets'])->name('assignments.personnelAssets')
        ->middleware('can:view-assignments');
    Route::put('/assignments/{assignment}/bulk-reassign-items', [AssetAssignmentController::class, 'bulkReassignItems'])->name('assignments.bulkReassignItems')
        ->middleware('can:reassign-assignments');
    Route::put('/assignments/{assignment}/bulk-reassign', [AssetAssignmentController::class, 'bulkReassign'])->name('assignments.bulkReassign')
        ->middleware('can:reassign-assignments');
    Route::get('/assignments/{assignment}/assets', [AssetAssignmentController::class, 'assignmentAssets'])->name('assignments.assignmentAssets')
        ->middleware('can:view-assignments');
    Route::get('/assignments/{assignment}/json', [AssetAssignmentController::class, 'showJson'])->name('assignments.show.json')
        ->middleware('can:view-assignments');

    // EQUIPMENT CODES
    Route::get('/equipment-codes', [EquipmentCodeController::class, 'index'])->name('equipment-codes.index')
        ->middleware('can:view-equipment-codes');
    Route::post('/equipment-codes', [EquipmentCodeController::class, 'store'])->name('equipment-codes.store')
        ->middleware('can:create-equipment-codes');
    Route::put('/equipment-codes/{equipmentCode}', [EquipmentCodeController::class, 'update'])->name('equipment-codes.update')
        ->middleware('can:update-equipment-codes');
    Route::get('/equipment-codes/view/{equipmentCode}', [EquipmentCodeController::class, 'show'])->name('equipment-codes.view')
        ->middleware('can:view-equipment-codes');
    Route::delete('/equipment-codes/{equipmentCode}', [EquipmentCodeController::class, 'destroy'])->name('equipment-codes.destroy')
        ->middleware('can:delete-equipment-codes');

    //PROFILE
    Route::get('/settings/profile', [ProfileController::class, 'edit'])->name('profile.edit')
        ->middleware('can:view-profile');
    Route::patch('/settings/profile', [ProfileController::class, 'update'])->name('profile.update')
        ->middleware('can:manage-profile');
    Route::delete('/profile/remove-image', [ProfileController::class, 'removeImage'])->name('profile.removeImage')
        ->middleware('can:manage-profile');
    Route::get('/settings/profile/json', [ProfileController::class, 'fetch'])->name('profile.fetch');

    // RESTORATION
    Route::get('/trash-bin', [TrashBinController::class, 'index'])->name('trash-bin.index')
        ->middleware('can:view-trash-bin');
    Route::post('/trash-bin/restore/{type}/{id}', [TrashBinController::class, 'restore'])->name('trash-bin.restore')
        ->middleware('can:restore-trash-bin');
    Route::delete('/trash-bin/permanent-delete/{type}/{id}', [TrashBinController::class, 'permanentDelete'])->name('trash.permanentDelete')
        ->middleware('can:permanent-delete-trash-bin');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
