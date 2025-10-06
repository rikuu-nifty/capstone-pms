<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Pagination\LengthAwarePaginator;

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

use App\Models\InventorySchedulingSignatory;
use App\Models\TransferSignatory;
use App\Models\TurnoverDisposalSignatory;
use App\Models\OffCampusSignatory;


class TrashBinController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->input('date_filter', 'all');
        $perPage = (int) $request->input('per_page', 20);

        $search = $request->input('search');
        $sortKey = $request->input('sort', 'id');
        $sortDir = $request->input('dir', 'desc');

        $currentOrgId = $request->input('current_org_id');
        $receivingOrgId = $request->input('receiving_org_id');
        $currentRoomId = $request->input('current_room_id');
        $receivingRoomId = $request->input('receiving_room_id');
        $scheduledDate = $request->input('scheduled_date');
        $issuingOfficeId = $request->input('issuing_office_id');

        $applyFilters = function ($query, $module = null) use ($filter, $request, $search, $sortKey, $sortDir) {
            return $query
                ->when($filter === 'current_year', fn($q) => $q->whereYear('deleted_at', now()->year))
                ->when($filter === 'last_quarter', fn($q) =>
                    $q->whereBetween('deleted_at', [
                        now()->subQuarter()->startOfQuarter(),
                        now()->subQuarter()->endOfQuarter(),
                    ])
                )
                ->when($filter === 'last_year', fn($q) => $q->whereYear('deleted_at', now()->subYear()->year))
                ->when($filter === 'custom' && $request->filled(['start', 'end']),
                    fn($q) => $q->whereBetween('deleted_at', [$request->start, $request->end])
                )
                ->when($search, function ($q) use ($module, $search) {
                    $q->where(function ($query) use ($module, $search) {
                        $like = '%' . $search . '%';
                        $enumNeedle = Str::slug($search, '_');
                        $enumLike   = '%' . $enumNeedle . '%';

                        match ($module) {
                            'inventory_lists' => $query
                                ->where('asset_name', 'like', $like)
                                ->orWhere('serial_no', 'like', $like)
                                ->orWhere('description', 'like', $like),
                            'inventory_schedulings' => $query->where(function ($query) use ($search) {
                                $like = '%' . $search . '%';
                                $query->where('inventory_schedule', 'like', $like);

                                // Optional: allow month name search
                                $monthMap = [
                                    'january' => '01',
                                    'february' => '02',
                                    'march' => '03',
                                    'april' => '04',
                                    'may' => '05',
                                    'june' => '06',
                                    'july' => '07',
                                    'august' => '08',
                                    'september' => '09',
                                    'october' => '10',
                                    'november' => '11',
                                    'december' => '12',
                                ];

                                $lowerSearch = strtolower($search);
                                if (isset($monthMap[$lowerSearch])) {
                                    $query->orWhere('inventory_schedule', 'like', '%-' . $monthMap[$lowerSearch]);
                                }
                            }),
                            'transfers' => $query->where(function ($sub) use ($like) {
                                $sub->where('id', 'like', $like)
                                    ->orWhereHas('currentOrganization', fn($q) =>
                                        $q->where('name', 'like', $like)
                                    )
                                    ->orWhereHas('receivingOrganization', fn($q) =>
                                        $q->where('name', 'like', $like)
                                    )
                                    // Related buildings and rooms
                                    ->orWhereHas('currentBuildingRoom.building', fn($q) =>
                                        $q->where('name', 'like', $like)
                                            ->orWhere('code', 'like', $like)
                                    )
                                    ->orWhereHas('receivingBuildingRoom.building', fn($q) =>
                                        $q->where('name', 'like', $like)
                                            ->orWhere('code', 'like', $like)
                                    )
                                    ->orWhereHas('currentBuildingRoom', fn($q) =>
                                        $q->where('room', 'like', $like)
                                    )
                                    ->orWhereHas('receivingBuildingRoom', fn($q) =>
                                        $q->where('room', 'like', $like)
                                    );
                                }),
                            'turnover_disposals' => $query
                                ->where('type', 'like', $like)
                                ->orWhereHas('personnel', fn($p) =>
                                    $p->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$like])
                                )
                                ->orWhereHas('issuingOffice', fn($o) => $o->where('name', 'like', $like)),
                            'off_campuses' => $query->where(function ($sub) use ($like, $enumLike) {
                                $sub
                                    ->where('requester_name', 'like', $like) // if user enters "official_use"
                                    ->orWhere('remarks', 'like', $like) // if user typed "official use"
                                    ->orWhere('remarks', 'like', $enumLike)
                                    ->orWhereHas('collegeOrUnit', fn($q) =>
                                        $q->where('name', 'like', $like)
                                    );
                            }),

                            'categories' => $query->where('name', 'like', $like),
                            'asset_models' => $query
                                ->where('brand', 'like', $like)
                                ->orWhere('model', 'like', $like),
                            'equipment_codes' => $query
                                ->where('code', 'like', $like),
                            'assignments' => $query->where(function ($query) use ($search) {
                                $like = '%' . $search . '%';
                                $monthMap = [
                                    'january' => '01',
                                    'february' => '02',
                                    'march' => '03',
                                    'april' => '04',
                                    'may' => '05',
                                    'june' => '06',
                                    'july' => '07',
                                    'august' => '08',
                                    'september' => '09',
                                    'october' => '10',
                                    'november' => '11',
                                    'december' => '12',
                                ];

                                $query->whereHas('personnel', fn($p) =>
                                    $p->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$like])
                                )
                                ->orWhere('date_assigned', 'like', $like);

                                $lowerSearch = strtolower($search);
                                if (isset($monthMap[$lowerSearch])) {
                                    $query->orWhereMonth('date_assigned', $monthMap[$lowerSearch]);
                                }
                            }),

                            'buildings' => $query->where('name', 'like', $like)
                                ->orWhere('code', 'like', $like),
                            'building_rooms' => $query->where(function ($query) use ($search) {
                                $like = '%' . $search . '%';
                                $query->where('room', 'like', $like)
                                    ->orWhereHas('building', fn($b) =>
                                        $b->where('name', 'like', $like)->orWhere('code', 'like', $like)
                                    );
                            }),
                            'personnels' => $query->where(function ($query) use ($search) {
                                $like = '%' . $search . '%';
                                $query->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$like])
                                    ->orWhere('first_name', 'like', $like)
                                    ->orWhere('middle_name', 'like', $like)
                                    ->orWhere('last_name', 'like', $like)
                                    ->orWhere('position', 'like', $like)
                                    ->orWhereHas('unitOrDepartment', fn($u) =>
                                        $u->where('name', 'like', $like)
                                    );
                            }),

                            'users' => $query->where('name', 'like', $like)
                                ->orWhere('email', 'like', $like),
                            'roles' => $query->where(function ($query) use ($search) {
                                $like = '%' . $search . '%';
                                $query->where('name', 'like', $like)
                                    ->orWhere('code', 'like', $like);
                            }),

                            default => $query->where('id', 'like', $like),
                        };
                    });
                })
                
                ->when($module === 'inventory_schedulings' && $request->filled('month'), function ($q) use ($request) {
                    $month = $request->input('month');
                    $q->where('inventory_schedule', 'like', '%-' . $month);
                })
                ->when($module === 'off_campuses' && $request->filled('purpose'), function ($q) use ($request) {
                    $q->where('purpose', $request->input('purpose'));
                })
                ->when($module === 'asset_models' && $request->filled('category_id'), function ($q) use ($request) {
                    $q->where('category_id', $request->input('category_id'));
                })
                ->when(
                    $module === 'turnover_disposals' && $request->filled('type'),
                    fn($q) => $q->where('type', $request->input('type'))
                )
                ->when($module === 'turnover_disposals' && $request->filled('issuing_office_id'), function ($q) use ($request) {
                    $q->where('issuing_office_id', $request->input('issuing_office_id'));
                })
                ->when($module === 'categories' && $request->filled('name'), function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->input('name') . '%');
                })
                ->when($module === 'equipment_codes' && $request->filled('category_id'), function ($q) use ($request) {
                    $q->where('category_id', $request->input('category_id'));
                })
                ->when($module === 'unit_or_departments' && $request->filled('category_id'), function ($q) use ($request) {
                    $q->where('category_id', $request->input('category_id'));
                })
                ->when($module === 'building_rooms' && $request->filled('building_id'), function ($q) use ($request) {
                    $q->where('building_id', $request->input('building_id'));
                })
                ->when($module === 'personnels' && $request->filled('unit_id'), function ($q) use ($request) {
                    $q->where('unit_or_department_id', $request->input('unit_id'));
                })
                ->when($module === 'transfers' && $request->filled('current_org_id'), fn($q) =>
                    $q->where('current_organization', $request->input('current_org_id'))
                )
                ->when($module === 'transfers' && $request->filled('receiving_org_id'), fn($q) =>
                    $q->where('receiving_organization', $request->input('receiving_org_id'))
                )
                ->when($module === 'transfers' && $request->filled('current_building_id'), function ($q) use ($request) {
                    $q->whereHas('currentBuildingRoom', function ($sub) use ($request) {
                        $sub->where('building_id', $request->input('current_building_id'));
                    });
                })
                ->when($module === 'transfers' && $request->filled('receiving_building_id'), function ($q) use ($request) {
                    $q->whereHas('receivingBuildingRoom', function ($sub) use ($request) {
                        $sub->where('building_id', $request->input('receiving_building_id'));
                    });
                })
                ->when($module === 'transfers' && $request->filled('scheduled_date'), fn($q) =>
                    $q->whereDate('scheduled_date', $request->input('scheduled_date'))
                )

                ->when($sortKey, function ($q) use ($sortKey, $sortDir, $module) {
                    // define allowed sort columns per module
                    $sortable = match ($module) {
                        'inventory_lists'       => ['id', 'asset_name', 'deleted_at'],
                        'inventory_schedulings' => ['id', 'inventory_schedule', 'deleted_at'],
                        'transfers'             => ['id', 'deleted_at'],
                        'turnover_disposals'    => ['id', 'type', 'deleted_at'],
                        'off_campuses'          => ['id', 'requester_name', 'deleted_at'],
                        'categories'            => ['id', 'name', 'deleted_at'],
                        'equipment_codes'       => ['id', 'code', 'deleted_at'],
                        'asset_models'          => ['id', 'model', 'brand', 'deleted_at'],
                        'assignments'           => ['id', 'date_assigned', 'deleted_at'],
                        'buildings'             => ['id', 'name', 'code', 'deleted_at'],
                        'building_rooms'        => ['id', 'room', 'deleted_at'],
                        'personnels'            => ['id', 'first_name', 'last_name', 'deleted_at'],
                        'users'                 => ['id', 'name', 'email', 'deleted_at'],
                        'roles'                 => ['id', 'name', 'code', 'deleted_at'],
                        default                 => ['id', 'deleted_at'],
                    };

                    // if user’s chosen sort key doesn’t exist in table, fallback to `id`
                    $column = in_array($sortKey, $sortable, true) ? $sortKey : 'id';
                    $q->orderBy($column, $sortDir);
                });
        };

        $totals = [
            'forms' => [
                'inventory_lists'       => InventoryList::onlyTrashed()->count(),
                'inventory_schedulings' => InventoryScheduling::onlyTrashed()->count(),
                'transfers'             => Transfer::onlyTrashed()->count(),
                'turnovers'             => TurnoverDisposal::onlyTrashed()->where('type', 'turnover')->count(),
                'disposals'             => TurnoverDisposal::onlyTrashed()->where('type', 'disposal')->count(),
                'off_campus_official' => OffCampus::onlyTrashed()->where('remarks', 'official_use')->count(),
                'off_campus_repair'   => OffCampus::onlyTrashed()->where('remarks', 'repair')->count(),
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

                'inventory_signatories' => InventorySchedulingSignatory::onlyTrashed()->count(),
                'transfer_signatories' => TransferSignatory::onlyTrashed()->count(),
                'turnover_disposal_signatories' => TurnoverDisposalSignatory::onlyTrashed()->count(),
                'off_campus_signatories' => OffCampusSignatory::onlyTrashed()->count(),
            ],
        ];

        $filterSources = [
            'categories' => Category::select('id', 'name')->orderBy('name')->get(),
            'equipment_categories' => Category::select('id', 'name')->orderBy('name')->get(),
            'asset_model_categories' => Category::select('id', 'name')->orderBy('name')->get(),
            'buildings' => Building::select('id', 'name')->orderBy('name')->get(),
            'units' => UnitOrDepartment::select('id', 'name')->orderBy('name')->get(),
            'rooms' => BuildingRoom::select('id', 'room as name')->orderBy('room')->get(),
        ];

        $selectedType = $request->input('signatory_type');
        $search = $request->input('search');

        $allSignatories = collect();

        $signatorySets = [
            'Inventory Scheduling' => InventorySchedulingSignatory::onlyTrashed(),
            'Property Transfer' => TransferSignatory::onlyTrashed(),
            'Turnover/Disposal' => TurnoverDisposalSignatory::onlyTrashed(),
            'Off-Campus' => OffCampusSignatory::onlyTrashed(),
        ];

        foreach ($signatorySets as $module => $query) {
            if ($selectedType && $selectedType !== $module) {
                continue; // skip other module types
            }

            if ($search) {
                $like = '%' . $search . '%';
                $lowerSearch = strtolower($search);

                $query->where(function ($q) use ($like, $lowerSearch, $module) {
                    $q->where('name', 'like', $like)
                        ->orWhere('title', 'like', $like)
                        ->orWhere('role_key', 'like', $like);

                    // Allow searching by module type name as well
                    if (Str::contains(strtolower($module), $lowerSearch)) {
                        // Dummy condition to include matches by module name
                        $q->orWhereRaw('1 = 1');
                    }
                });
            }

            $records = $query->get()->map(fn($s) => $s->setAttribute('module_type', $module));
            $allSignatories = $allSignatories->merge($records);
        }

        $allSignatories = $allSignatories->sortByDesc('deleted_at')->values();


        $page = LengthAwarePaginator::resolveCurrentPage();
        $paged = $allSignatories->forPage($page, $perPage)->values();

        $signatories = new LengthAwarePaginator(
            $paged,
            $allSignatories->count(),
            $perPage,
            $page,
            ['path' => LengthAwarePaginator::resolveCurrentPath()]
        );

        return Inertia::render('trash-bin/index', [
            // Forms group
            'inventory_lists' => $applyFilters(InventoryList::onlyTrashed(), 'inventory_lists')
                ->paginate($perPage)->withQueryString(),
            'inventory_schedulings' => $applyFilters(InventoryScheduling::onlyTrashed(), 'inventory_schedulings')
                ->paginate($perPage)->withQueryString(),
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
                    ]),
                'transfers'
            )->paginate($perPage)->withQueryString(),
            'turnover_disposals' => $applyFilters(
                TurnoverDisposal::onlyTrashed()
                    ->with([
                        'personnel:id,first_name,middle_name,last_name',
                        'issuingOffice:id,name'
                    ]),
                'turnover_disposals'
            )->paginate($perPage)->withQueryString(),
            'off_campuses' => $applyFilters(
                OffCampus::onlyTrashed()->with(['collegeOrUnit:id,name']),
                'off_campuses'
            )->paginate($perPage)->withQueryString(),

            // Assets group
            'asset_models' => $applyFilters(AssetModel::onlyTrashed(), 'asset_models')
                ->paginate($perPage)->withQueryString(),
            'categories' => $applyFilters(Category::onlyTrashed(), 'categories')
                ->paginate($perPage)->withQueryString(),
            'assignments' => $applyFilters(
                AssetAssignment::onlyTrashed()
                    ->with(['personnel:id,first_name,middle_name,last_name']),
                'assignments'
            )->paginate($perPage)->withQueryString(),
            'equipment_codes' => $applyFilters(EquipmentCode::onlyTrashed(), 'equipment_codes')
                ->paginate($perPage)->withQueryString(),

            // Institutional Setup
            'buildings' => $applyFilters(Building::onlyTrashed(), 'buildings')
                ->paginate($perPage)->withQueryString(),
            'building_rooms' => $applyFilters(
                BuildingRoom::onlyTrashed()
                    ->with(['building' => function ($q) {
                        $q->select('id', 'name', 'code')->withTrashed();
                    }]),
                'building_rooms'
            )->paginate($perPage)->withQueryString(),
            'personnels' => $applyFilters(
                Personnel::onlyTrashed()
                    ->with(['unitOrDepartment:id,name']),
                'personnels'
            )->paginate($perPage)->withQueryString(),
            'unit_or_departments' => $applyFilters(UnitOrDepartment::onlyTrashed(), 'unit_or_departments')
                ->paginate($perPage)->withQueryString(),

            // User Management
            'users' => $applyFilters(
                User::onlyTrashed()->with([
                    'role:id,name',
                    'unitOrDepartment:id,name',
                ]),
                'users'
            )->paginate($perPage)->withQueryString(),
            'roles' => $applyFilters(Role::onlyTrashed(), 'roles')
                ->paginate($perPage)->withQueryString(),

            'filters' => [
                'date_filter' => $filter,
                'start'       => $request->start,
                'end'         => $request->end,
                'per_page'    => $perPage,
                'search'      => $search,
                'sort'        => $sortKey,
                'dir'         => $sortDir,

                'month'               => $request->input('month'),
                'purpose'             => $request->input('purpose'),
                'type'                => $request->input('type'),
                'name'                => $request->input('name'),
                'category_id'         => $request->input('category_id'),
                'building_id'         => $request->input('building_id'),
                'unit_id'             => $request->input('unit_id'),
                'current_org_id'      => $request->input('current_org_id'),
                'receiving_org_id'    => $request->input('receiving_org_id'),
                'current_building_id' => $request->input('current_building_id'),
                'receiving_building_id' => $request->input('receiving_building_id'),
                'scheduled_date'      => $request->input('scheduled_date'),
                'issuing_office_id'   => $request->input('issuing_office_id'),

                'signatory_type' => $request->input('signatory_type'),
            ],

            'totals' => $totals,
            'filterSources' => $filterSources,

            'signatories' => $signatories,
        ]);
    }

    public function restore(string $type, int $id)
    {
        if ($type === 'signatory') {
            $signatory = collect([
                InventorySchedulingSignatory::class,
                TransferSignatory::class,
                TurnoverDisposalSignatory::class,
                OffCampusSignatory::class,
            ])
                ->map(fn($model) => $model::withTrashed()->find($id))
                ->filter()
                ->first();

            if ($signatory) {
                $signatory->restore();
                return back()->with('success', 'Signatory restored successfully.');
            }

            return back()->with('error', 'Signatory not found.');
        }

        $model = $this->resolveModel($type)::withTrashed()->findOrFail($id);
        $model->restore();

        // if ($type === 'turnover-disposal') {
        //     $model->turnoverDisposalAssets()->withTrashed()->restore();
        // }

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
