<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\InventoryList;
use App\Models\InventoryScheduling;
use App\Models\Transfer;
use App\Models\TurnoverDisposal;
use App\Models\OffCampus;

use App\Models\AssetModel;
use App\Models\Category;
use App\Models\AssetAssignment;
use App\Models\EquipmentCode;

use App\Models\Building;
use App\Models\BuildingRoom;
use App\Models\Personnel;
use App\Models\UnitOrDepartment;

use App\Models\User;
use App\Models\Role;
//NO SIGNATORIES YET

class TrashBinController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->input('date_filter', 'all');
        $perPage = (int) $request->input('per_page', 20);

        $applyFilters = function ($query) use ($filter, $request) {
            return $query
                ->when(
                    $filter === 'current_year',
                    fn($q) =>
                    $q->whereYear('deleted_at', now()->year)
                )
                ->when(
                    $filter === 'last_quarter',
                    fn($q) =>
                    $q->whereBetween('deleted_at', [
                        now()->subQuarter()->startOfQuarter(),
                        now()->subQuarter()->endOfQuarter(),
                    ])
                )
                ->when(
                    $filter === 'last_year',
                    fn($q) =>
                    $q->whereYear('deleted_at', now()->subYear()->year)
                )
                ->when(
                    $filter === 'custom' && $request->filled(['start', 'end']),
                    fn($q) =>
                    $q->whereBetween('deleted_at', [$request->start, $request->end])
                );
        };

        $totals = [
            'forms' => [
                'inventory_lists'       => InventoryList::onlyTrashed()->count(),
                'inventory_schedulings' => InventoryScheduling::onlyTrashed()->count(),
                'transfers'             => Transfer::onlyTrashed()->count(),
                'turnovers'             => TurnoverDisposal::onlyTrashed()->where('type', 'turnover')->count(),
                'disposals'             => TurnoverDisposal::onlyTrashed()->where('type', 'disposal')->count(),
                'off_campus_official'   => OffCampus::onlyTrashed()->where('purpose', 'official_use')->count(),
                'off_campus_repair'     => OffCampus::onlyTrashed()->where('purpose', 'repair')->count(),
            ],
            'assets' => [
                'categories'      => Category::onlyTrashed()->count(),
                'equipment_codes' => EquipmentCode::onlyTrashed()->count(),
                'asset_models'    => AssetModel::onlyTrashed()->count(),
                'assignments'     => AssetAssignment::onlyTrashed()->count(),
            ],
            'institutional' => [
                'unit_or_departments' => UnitOrDepartment::onlyTrashed()->count(),
                'buildings'           => Building::onlyTrashed()->count(),
                'building_rooms'      => BuildingRoom::onlyTrashed()->count(),
                'personnels'          => Personnel::onlyTrashed()->count(),
            ],
            'usermgmt' => [
                'users' => User::onlyTrashed()->count(),
                'roles' => Role::onlyTrashed()->count(),
                // add signatories if needed later
            ],
        ];

        return Inertia::render('trash-bin/index', [
            'inventory_lists'       => $applyFilters(InventoryList::onlyTrashed())->paginate($perPage)->withQueryString(),
            'inventory_schedulings' => $applyFilters(InventoryScheduling::onlyTrashed())->paginate($perPage)->withQueryString(),

            'transfers' => $applyFilters(
                Transfer::onlyTrashed()
                    ->with([
                        'currentOrganization:id,name',
                        'receivingOrganization:id,name',
                        'currentBuildingRoom' => function ($q) {
                            $q->select('id', 'building_id', 'room as name')
                                ->with('building:id,name,code');
                        },
                        'receivingBuildingRoom' => function ($q) {
                            $q->select('id', 'building_id', 'room as name')
                                ->with('building:id,name,code');
                        },
                    ])
            )->paginate($perPage)->withQueryString(),

            'turnover_disposals' => $applyFilters(TurnoverDisposal::onlyTrashed()
                ->with([
                    'personnel:id,first_name,middle_name,last_name',
                    'issuingOffice:id,name'
                ])
            )->paginate($perPage)->withQueryString(),

            'off_campuses' => $applyFilters(OffCampus::onlyTrashed()
                ->with(['collegeOrUnit:id,name'])
            )->paginate($perPage)->withQueryString(),

            // Assets group
            'asset_models'          => $applyFilters(AssetModel::onlyTrashed())->paginate($perPage)->withQueryString(),
            'categories'            => $applyFilters(Category::onlyTrashed())->paginate($perPage)->withQueryString(),
            'assignments' => $applyFilters(AssetAssignment::onlyTrashed()
                ->with(['personnel:id,first_name,middle_name,last_name'])
            )->paginate($perPage)->withQueryString(),
            
            'equipment_codes'       => $applyFilters(EquipmentCode::onlyTrashed())->paginate($perPage)->withQueryString(),

            // Institutional Setup
            'buildings'          => $applyFilters(Building::onlyTrashed())->paginate($perPage)->withQueryString(),

            'building_rooms' => $applyFilters(BuildingRoom::onlyTrashed()
                ->with(['building' => function ($q) {
                    $q->select('id', 'name', 'code')->withTrashed();
                }])
            )->paginate($perPage)->withQueryString(),

            'personnels' => $applyFilters(Personnel::onlyTrashed()
                ->with(['unitOrDepartment:id,name'])
            )->paginate($perPage)->withQueryString(),

            'unit_or_departments' => $applyFilters(UnitOrDepartment::onlyTrashed())->paginate($perPage)->withQueryString(),

            // User Management
            'users' => $applyFilters(User::onlyTrashed()
                ->with([
                    'role:id,name',
                    'unitOrDepartment:id,name',
                ])
            )->paginate($perPage)->withQueryString(),

            'roles'              => $applyFilters(Role::onlyTrashed())->paginate($perPage)->withQueryString(),

            'filters' => [
                'date_filter' => $filter,
                'start'       => $request->start,
                'end'         => $request->end,
                'per_page'    => $perPage,
            ],

            'totals' => $totals,
        ]);
    }

    public function restore(string $type, int $id)
    {
        $model = $this->resolveModel($type)::withTrashed()->findOrFail($id);
        $model->restore();

        return back()->with('success', ucfirst($type) . ' restored successfully.');
    }

    private function resolveModel(string $type): string
    {
        return match ($type) {
            'inventory-list'     => InventoryList::class,
            'inventory-schedule' => InventoryScheduling::class,
            'transfer'           => Transfer::class,
            'turnover-disposal'  => TurnoverDisposal::class,
            'off-campus'         => OffCampus::class,

            'asset-model'        => AssetModel::class,
            'category'           => Category::class,
            'assignment'         => AssetAssignment::class,
            'equipment-code'     => EquipmentCode::class,

            'building'           => Building::class,
            'building-room'      => BuildingRoom::class,
            'personnel'          => Personnel::class,
            'unit-or-department' => UnitOrDepartment::class,

            'user'               => User::class,
            'role'               => Role::class,

            default => abort(404),
        };
    }
}
