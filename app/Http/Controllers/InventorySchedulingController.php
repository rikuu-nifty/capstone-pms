<?php

namespace App\Http\Controllers;
// use App\Http\Requests\InventoryListAddNewAssetFormRequest;
use Inertia\Inertia;
use App\Models\InventoryScheduling;
use App\Models\UnitOrDepartment;
use App\Models\Building;
use App\Models\BuildingRoom;
use App\Models\User;
use App\Models\InventorySchedulingSignatory;
use App\Models\InventoryList;
use App\Models\AuditTrail;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

use App\Traits\LogsAuditTrail;

class InventorySchedulingController extends Controller
{
    use LogsAuditTrail;

    public function index()
    {
        $schedules = InventoryScheduling::with([
            'building',
            'unitOrDepartment',
            'buildingRoom',
            'user',
            'designatedEmployee',
            'assignedBy',
            'preparedBy',     // include preparer relationship
            'approvals.steps', // keep approvals lightweight here (pending-only, handled in FormApprovalController)
            
            'buildings',
            'rooms.subAreas',
            'subAreas',
            'units',
            'assets.asset',
        ])
        ->withCount('assets')
        ->latest()
        ->get();

        $assets = InventoryList::with([
            'building',
            'buildingRoom.subAreas',
            'subArea',
            'unitOrDepartment'
        ])->get();

        $buildings = Building::withCount(['buildingRooms as building_rooms_count', 'assets'])->get();
        $buildingRooms = BuildingRoom::with(['building', 'subAreas'])->get();
        $unitOrDepartments = UnitOrDepartment::all();
        $users = User::with('role:id,name,code')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_name' => $user->role->name ?? null,
                ];
            }
        );

        // Add computed flag to each schedule
        $schedules->each(function ($schedule) {
            $schedule->isFullyApproved = $schedule->approvals
                ->flatMap->steps
                ->filter(fn($s) => in_array($s->code, ['noted_by', 'approved_by']))
                ->every(fn($s) => $s->status === 'approved');
        });

        // also load signatories for the page
        $signatories = InventorySchedulingSignatory::all()->keyBy('role_key');

        return Inertia::render('inventory-scheduling/index', [
            'schedules' => $schedules,
            'buildings' => $buildings,
            'buildingRooms' => $buildingRooms,
            'unitOrDepartments' => $unitOrDepartments,
            'users' => $users,
            // 'auth' => ['user' => auth()->user()], // 👈 make sure this is included
            'signatories' => $signatories, // 👈 pass signatories
            'assets' => $assets,

            'totals' => InventoryScheduling::kpiStats(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
     public function store(Request $request)
    {
        $data = $request->validate([
            'scope_type'                => ['required', Rule::in(['unit', 'building'])],
            'unit_ids'                  => ['required_if:scope_type,unit', 'array'],
            'unit_ids.*'                => ['integer', Rule::exists('unit_or_departments', 'id')],
            'building_ids'              => ['required_if:scope_type,building', 'array'],
            'building_ids.*'            => ['integer', Rule::exists('buildings', 'id')],
            'room_ids'                  => ['required', 'array', 'min:1'],
            'room_ids.*'                => ['integer', Rule::exists('building_rooms', 'id')],
            'sub_area_ids'              => ['array'],
            'sub_area_ids.*'            => ['integer', Rule::exists('sub_areas', 'id')],

            'inventory_schedule'        => ['required', 'string'],
            'actual_date_of_inventory'  => ['nullable', 'date'],
            'checked_by'                => ['nullable', 'string'],
            'verified_by'               => ['nullable', 'string'],
            'received_by'               => ['nullable', 'string'],
            'scheduling_status'         => ['required', 'string'],
            'description'               => ['nullable', 'string'],
            'designated_employee'       => ['nullable', 'integer', 'exists:users,id'],
        ]);

        // Create schedule
        $schedule = DB::transaction(function () use ($data) {
            $schedule = InventoryScheduling::create([
                'prepared_by_id'          => Auth::id(),
                'inventory_schedule'      => $data['inventory_schedule'],
                'actual_date_of_inventory'=> $data['actual_date_of_inventory'] ?? null,
                'checked_by'              => $data['checked_by'] ?? null,
                'verified_by'             => $data['verified_by'] ?? null,
                'received_by'             => $data['received_by'] ?? null,
                'scheduling_status'       => $data['scheduling_status'],
                'description'             => $data['description'] ?? null,
                'designated_employee'     => $data['designated_employee'] ?? null,

                // 👇 Reflect first selected values in main table
                'building_id'             => $data['building_ids'][0] ?? null,
                'building_room_id'        => $data['room_ids'][0] ?? null,
                'unit_or_department_id'   => $data['unit_ids'][0] ?? null,
            ]);

            // Attach pivots + fetch assets
            $schedule->syncScopeAndAssets($data);

            // Make sure sub-areas pivot is updated
            $schedule->subAreas()->sync($data['sub_area_ids'] ?? []);

            return $schedule;
        });

        $schedule->load([
            'units','buildings','rooms','subAreas','assets.asset',
            'preparedBy','approvals','approvals.steps',
        ]);

        return redirect()->back()->with([
            'success'     => 'Schedule added successfully.',
            'newSchedule' => $schedule,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(InventoryScheduling $inventory_scheduling)
    {
        $schedules = InventoryScheduling::with([
            'building',
            'buildingRoom',
            'unitOrDepartment',
            'user',
            'designatedEmployee',
            'assignedBy',
            'preparedBy', // 👈 include preparer
            // approvals omitted here to keep list lightweight
        ])->latest()->get();

        $buildings         = Building::all();
        $buildingRooms     = BuildingRoom::with(['building', 'subAreas'])->get(); // updated
        $unitOrDepartments = UnitOrDepartment::all();
        $users             = User::all();

        // load the single schedule for viewing
        $viewing = InventoryScheduling::with([
            'building',
            'buildingRoom',
            'unitOrDepartment',
            'user',
            'designatedEmployee',
            'assignedBy',
            'preparedBy',     
            'approvals' => fn ($q) => $q->with(['steps.actor' => fn($s) => $s->select('id','name')]),

            'units',
            'buildings',
            'rooms.building',
            'subAreas.room',
            'assets' => fn($q) => $q->select('id', 'inventory_scheduling_id', 'inventory_list_id', 'inventory_status'),
            'assets.asset.buildingRoom',
            'assets.asset.subArea',
            'assets.asset.assetModel.category',
            'assets.asset.schedulingAssets',
        ])->findOrFail($inventory_scheduling->id);

        
        // compute approval completion flag only require approvals from PMO Head (noted_by) and VP Admin (approved_by)
        $isFullyApproved = $viewing->approvals
            ->flatMap->steps
            ->filter(fn($s) => in_array($s->code, ['noted_by', 'approved_by'])) // only PMO Head + VP Admin
            ->every(fn($s) => $s->status === 'approved');


        // Fetch assets specific to this building room, and optionally match building + department if provided
        $assets = InventoryList::with(['category', 'assetModel'])
            ->where('building_room_id', $viewing->building_room_id)
            ->when($viewing->building_id, fn($q) => 
                $q->where('building_id', $viewing->building_id)
            )
            ->when($viewing->unit_or_department_id, fn($q) => 
                $q->where('unit_or_department_id', $viewing->unit_or_department_id)
            )
            ->get();

        // also load signatories
        $signatories = InventorySchedulingSignatory::all()->keyBy('role_key');

        // If frontend explicitly asks for JSON, return raw data (for refresh)
        if (request()->wantsJson()) {
            return response()->json([
                'viewing'         => $viewing,
                'assets'          => $viewing->assets,
                'signatories'     => $signatories,
                'isFullyApproved' => $isFullyApproved,
            ]);
        }

        return Inertia::render('inventory-scheduling/index', [
            'schedules'         => $schedules, 
            'buildings'         => $buildings,
            'buildingRooms'     => $buildingRooms,
            'unitOrDepartments' => $unitOrDepartments,
            'users'             => $users,

            'viewing'           => $viewing,      // 👈 now provided with full approvals
            'assets'            => $viewing->assets,       // 👈 pass assets to frontend
            'signatories'       => $signatories,  // 👈 now provided
            'isFullyApproved'   => $isFullyApproved, // 👈 pass flag to frontend

            // 'auth'              => ['user' => auth()->user()], // 👈 FIX: include auth like in index()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
     public function update(Request $request, InventoryScheduling $inventoryScheduling)
    {
        $data = $request->validate([
            'scope_type'            => ['required', Rule::in(['unit', 'building'])],
            'unit_ids'              => ['required_if:scope_type,unit', 'array'],
            'unit_ids.*'            => ['integer', Rule::exists('unit_or_departments', 'id')],
            'building_ids'          => ['required_if:scope_type,building', 'array'],
            'building_ids.*'        => ['integer', Rule::exists('buildings', 'id')],
            'room_ids'              => ['required', 'array', 'min:1'],
            'room_ids.*'            => ['integer', Rule::exists('building_rooms', 'id')],
            'sub_area_ids'          => ['array'],
            'sub_area_ids.*'        => ['integer', 'exists:sub_areas,id'],

            'building_id'           => ['nullable','integer','exists:buildings,id'],
            'building_room_id'      => ['nullable','integer','exists:building_rooms,id'],
            'unit_or_department_id' => ['nullable','integer','exists:unit_or_departments,id'],
            'user_id'               => ['nullable','integer','exists:users,id'],
            'designated_employee'   => ['nullable','integer','exists:users,id'],
            'assigned_by'           => ['nullable','integer','exists:users,id'],
            'inventory_schedule'    => ['required','string'],
            'actual_date_of_inventory' => ['nullable','date'],
            'checked_by'            => ['nullable','string'],
            'verified_by'           => ['nullable','string'],
            'received_by'           => ['nullable','string'],
            'scheduling_status'     => ['required','string'],
            'description'           => ['nullable','string'],
        ]);

        $data = array_map(fn($v) => $v === '' ? null : $v, $data);

        DB::transaction(function () use ($inventoryScheduling, $data) {
            if (strtolower($data['scheduling_status']) === 'pending_review') {
                $inventoryScheduling->approvals()->each(fn ($approval) => $approval->resetToPending());
            }

            $inventoryScheduling->update([
                ...$data,

                // Always keep single FKs aligned with pivot arrays
                'building_id'           => $data['building_ids'][0] ?? $data['building_id'] ?? null,
                'building_room_id'      => $data['room_ids'][0] ?? $data['building_room_id'] ?? null,
                'unit_or_department_id' => $data['unit_ids'][0] ?? $data['unit_or_department_id'] ?? null,
            ]);

            $inventoryScheduling->syncScopeAndAssets($data);
            $inventoryScheduling->subAreas()->sync($data['sub_area_ids'] ?? []); // Make sure sub-areas pivot is updated

            // Update related asset statuses based on scheduling_status
            $status = strtolower($data['scheduling_status']);

            if ($status === 'completed') {
                // Set to inventoried, but keep not_inventoried untouched
                $inventoryScheduling->assets()->where('inventory_status', '!=', 'not_inventoried')->update(['inventory_status' => 'inventoried']);
            } elseif ($status === 'pending') {
                $inventoryScheduling->assets()->update(['inventory_status' => 'scheduled']);
            } elseif ($status === 'cancelled') {
                $inventoryScheduling->assets()->update(['inventory_status' => 'not_inventoried']);
            }
        });

        $inventoryScheduling->load([
            'units','buildings','rooms','subAreas','assets.asset',
            'building','unitOrDepartment','buildingRoom',
            'user','designatedEmployee','assignedBy','preparedBy',
            'approvals' => fn ($q) => $q->with(['steps' => fn ($s) => $s->orderBy('step_order')]),
        ]);

        return back()->with('success', 'Schedule updated.');
    }

    public function destroy(InventoryScheduling $inventoryScheduling)
    {
        $inventoryScheduling->delete();
        return redirect()->back()->with('success', 'The Inventory Schedule Has Been Deleted Successfully.');
    }

    public function restore(int $id)
    {
        $schedule = InventoryScheduling::withTrashed()->findOrFail($id);
        $schedule->restore();
        return back()->with('success', 'Schedule restored successfully.');
    }

    public function rowAssets(Request $request, InventoryScheduling $schedule, int $rowId)
    {
        $perPage = (int) $request->input('per_page', 10);
        $type = $request->input('type', 'building_room');
        $unitId = $request->input('unit_id'); // 👈

        $query = $schedule->assets()->with(['asset.assetModel.category']);

        $query->whereHas('asset', function ($q) use ($rowId, $type, $schedule, $unitId) {
            if ($type === 'sub_area') {
                $q->where('sub_area_id', $rowId);
            } else {
                $q->where('building_room_id', $rowId)
                    ->whereNull('sub_area_id');;
            }

            if ($unitId) {
                $q->where('unit_or_department_id', $unitId);
            } elseif ($schedule->units()->exists()) {
                $q->whereIn('unit_or_department_id', $schedule->units->pluck('id'));
            }
        });

        $paginated = $query->paginate($perPage);

        $transformed = $paginated->through(function ($pivot) {
            return [
                'id' => $pivot->asset->id,
                'asset_name' => $pivot->asset->asset_name,
                'serial_no' => $pivot->asset->serial_no,
                'inventory_status' => $pivot->inventory_status,
                'unit_or_department_id' => $pivot->asset->unit_or_department_id,
                'asset_model' => $pivot->asset->assetModel
                    ? [
                        'category' => [
                            'name' => $pivot->asset->assetModel->category->name ?? null,
                        ],
                    ]
                    : null,
            ];
        });

        return response()->json($transformed);
    }

    public function updateAssetStatus(Request $request, InventoryScheduling $schedule, $assetId)
    {
        $data = $request->validate([
            'inventory_status' => ['required', Rule::in(['not_inventoried', 'scheduled', 'inventoried'])],
        ]);

        // get the pivot record before updating
        $pivot = $schedule->assets()->where('inventory_list_id', $assetId)->first();
        $oldStatus = $pivot?->inventory_status;

        // update the pivot model (InventorySchedulingAsset)
        $schedule->assets()
            ->where('inventory_list_id', $assetId)
            ->update(['inventory_status' => $data['inventory_status']]);

        // log action with explicit action + subject_type
        $log = AuditTrail::create([
            'auditable_type'        => get_class($schedule),
            'auditable_id'          => $schedule->id,
            'actor_id'              => auth()->id(),
            'actor_name'            => auth()->user()?->name,
            'unit_or_department_id' => auth()->user()?->unit_or_department_id,
            'action'                => 'singleAsset_update',
            'subject_type'          => 'InventoryAssetStatus',
            'old_values'            => ['inventory_status' => $oldStatus],
            'new_values'            => ['inventory_status' => $data['inventory_status']],
            'ip_address'            => $request->ip(),
            'user_agent'            => $request->header('User-Agent'),
            'route'                 => $request->path(),
        ]);

        return response()->json(['success' => true]);
    }

    public function bulkUpdateAssetStatus(Request $request, InventoryScheduling $schedule, int $rowId)
    {
        $data = $request->validate([
            'inventory_status' => ['required', Rule::in(['not_inventoried', 'scheduled', 'inventoried'])],
            'type' => ['required', Rule::in(['building_room', 'sub_area'])],
            'unit_id' => ['nullable', 'integer', 'exists:unit_or_departments,id'],
        ]);

        $query = $schedule->assets();

        $query->whereHas('asset', function ($q) use ($rowId, $data, $schedule) {
            if ($data['type'] === 'sub_area') {
                $q->where('sub_area_id', $rowId);
            } else {
                $q->where('building_room_id', $rowId)
                    ->whereNull('sub_area_id'); // exclude subarea assets
            }

            if (!empty($data['unit_id'])) {
                $q->where('unit_or_department_id', $data['unit_id']);
            } elseif ($schedule->units()->exists()) {
                $q->whereIn('unit_or_department_id', $schedule->units->pluck('id'));
            }
        });

        // collect affected assets before update
        $affectedAssets = $query->get(['inventory_list_id', 'inventory_status']);

        $query->update(['inventory_status' => $data['inventory_status']]);

        // log one bulk action
        $this->logAction(
            'bulk_update',
            $schedule,
            ['affected_assets' => $affectedAssets->pluck('inventory_status', 'inventory_list_id')],
            ['new_status' => $data['inventory_status'], 'count' => $affectedAssets->count()]
        );

        // override subject_type
        AuditTrail::latest()->first()->update([
            'subject_type' => 'InventoryAssetStatus',
        ]);

        return response()->json(['success' => true]);
    }

    public function exportPdf(int $id)
    {
        $schedule = InventoryScheduling::with([
            'preparedBy',
            'units',
            'assets.asset.buildingRoom.building',
            'assets.asset.subArea',
        ])->findOrFail($id);

        $rows = [];
        $isUnitScope = $schedule->scope_type === 'unit';

        // Identify rooms and buildings actually linked through scheduled assets
        $assets = $schedule->assets->filter(fn($a) => !empty($a->asset?->building_room_id));

        $roomGroups = $assets
            ->groupBy(fn($a) => $a->asset->building_room_id)
            ->map(function ($group) {
                $room = $group->first()->asset->buildingRoom;
                $building = $room?->building;
                $statuses = collect($group)
                    ->pluck('inventory_status')
                    ->map(fn($s) => strtolower($s))
                    ->unique();

                // Map statuses
                $mappedStatus = $statuses->map(fn($s) => match ($s) {
                    'inventoried' => 'Completed',
                    'scheduled', 'not_inventoried' => 'Pending',
                    default => '—',
                });

                $status = $mappedStatus->count() > 1 ? 'Partially Completed' : $mappedStatus->first();

                return [
                    'room_id' => $room?->id,
                    'room_name' => $room?->room ?? '—',
                    'building_id' => $building?->id,
                    'building_name' => $building?->name ?? '—',
                    'asset_count' => $group->count(),
                    'status' => $status ?? '—',
                ];
            });

        // Group data for display
        if ($isUnitScope && $schedule->units->isNotEmpty()) {
            foreach ($schedule->units as $unit) {
                $unitName = $unit->name ?? '—';
                $rows[$unitName] = [];

                // Buildings actually referenced by assets
                $buildings = $roomGroups->groupBy('building_id');

                foreach ($buildings as $buildingId => $roomSet) {
                    $buildingName = $roomSet->first()['building_name'] ?? '—';
                    $rows[$unitName][$buildingName] = [];

                    foreach ($roomSet as $roomData) {
                        $rows[$unitName][$buildingName][] = [
                            'room' => $roomData['room_name'],
                            'asset_count' => $roomData['asset_count'],
                            'status' => $roomData['status'],
                        ];
                    }
                }
            }
        } else {
            // === BUILDING SCOPE ===
            $buildings = $roomGroups->groupBy('building_id');

            foreach ($buildings as $buildingId => $roomSet) {
                $buildingName = $roomSet->first()['building_name'] ?? '—';
                $rows[$buildingName] = [];

                foreach ($roomSet as $roomData) {
                    $rows[$buildingName][] = [
                        'room' => $roomData['room_name'],
                        'asset_count' => $roomData['asset_count'],
                        'status' => $roomData['status'],
                    ];
                }
            }
        }

        $signatories = InventorySchedulingSignatory::all()->keyBy('role_key');

        $pdf = Pdf::loadView('forms.inventory_scheduling_form_pdf', [
            'schedule' => $schedule,
            'rows' => $rows,
            'signatories' => $signatories,
        ])
        ->setPaper('A4', 'portrait')
        ->setOption('isPhpEnabled', true);

        $timestamp = now()->format('Y-m-d');

        return $pdf->download("Inventory-Schedule-Form-{$schedule->id}-{$timestamp}.pdf");
        // return $pdf->stream("Inventory-Schedule-Form-{$schedule->id}.pdf");
    }
}
