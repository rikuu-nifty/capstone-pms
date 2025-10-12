<?php

namespace App\Providers;

use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;

// Audit Trail
use App\Models\InventoryList;
use App\Observers\InventoryListObserver;

use App\Models\InventoryScheduling;
use App\Observers\InventorySchedulingObserver;

use App\Models\Transfer;
use App\Observers\PropertyTransferObserver;

use App\Models\TurnoverDisposal;
use App\Observers\TurnoverDisposalObserver;

use App\Models\OffCampus;
use App\Observers\OffCampusObserver;

use App\Models\FormApproval;
use App\Observers\FormApprovalObserver;

use App\Models\FormApprovalSteps;
use App\Observers\FormApprovalStepsObserver;

use App\Models\Category;
use App\Observers\CategoryObserver;

use App\Models\AssetModel;
use App\Observers\AssetModelObserver;

use App\Models\Building;
use App\Observers\BuildingObserver;

use App\Models\BuildingRoom;
use App\Observers\BuildingRoomObserver;

use App\Models\UnitOrDepartment;
use App\Observers\UnitOrDepartmentObserver;

use App\Models\AssetAssignment;
use App\Observers\AssetAssignmentObserver;

use App\Models\AssetAssignmentItem;
use App\Observers\AssetAssignmentItemObserver;

use App\Models\EquipmentCode;
use App\Observers\EquipmentCodeObserver;

use App\Models\Personnel;
use App\Observers\PersonnelObserver;

use App\Models\Role;
use App\Observers\RoleObserver;

// Signatories
use App\Models\InventorySchedulingSignatory;
use App\Observers\InventorySchedulingSignatoryObserver;
use App\Models\TransferSignatory;
use App\Observers\TransferSignatoryObserver;
use App\Models\TurnoverDisposalSignatory;
use App\Observers\TurnoverDisposalSignatoryObserver;
use App\Models\OffCampusSignatory;
use App\Observers\OffCampusSignatoryObserver;




class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        InventoryList::observe(InventoryListObserver::class);
        InventoryScheduling::observe(InventorySchedulingObserver::class);
        Transfer::observe(PropertyTransferObserver::class);
        TurnoverDisposal::observe(TurnoverDisposalObserver::class);
        OffCampus::observe(OffCampusObserver::class);
        FormApproval::observe(FormApprovalObserver::class);
        FormApprovalSteps::observe(FormApprovalStepsObserver::class);
        Category::observe(CategoryObserver::class);
        AssetModel::observe(AssetModelObserver::class);
        Building::observe(BuildingObserver::class);
        BuildingRoom::observe(BuildingRoomObserver::class);
        UnitOrDepartment::observe(UnitOrDepartmentObserver::class);
        AssetAssignment::observe(AssetAssignmentObserver::class);
        AssetAssignmentItem::observe(AssetAssignmentItemObserver::class);
        EquipmentCode::observe(EquipmentCodeObserver::class);
        Personnel::observe(PersonnelObserver::class);
        Role::observe(RoleObserver::class);


        InventorySchedulingSignatory::observe(InventorySchedulingSignatoryObserver::class);
        TransferSignatory::observe(TransferSignatoryObserver::class);
        TurnoverDisposalSignatory::observe(TurnoverDisposalSignatoryObserver::class);
        OffCampusSignatory::observe(OffCampusSignatoryObserver::class);
        
        // Existing nav metrics
        Inertia::share('nav_metrics', function () {
            return Cache::remember('nav_metrics', 30, function () {
                return [
                    'pending_user_approvals' => User::where('status', 'pending')->count(),
                ];
            });
        });

        // Notifications (all + unread count)
        Inertia::share('notifications', function () {
            $user = auth()->user();

            return $user
                ? [
                    'items' => $user->notifications()->latest()->take(10)->get(),
                    'unread_count' => $user->unreadNotifications()->count(),
                ]
                : [
                    'items' => [],
                    'unread_count' => 0,
                ];
            });
        
        }
}
