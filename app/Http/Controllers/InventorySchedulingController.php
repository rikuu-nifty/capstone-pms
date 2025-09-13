<?php

namespace App\Http\Controllers;
// use App\Http\Requests\InventoryListAddNewAssetFormRequest;
use Inertia\Inertia;
use App\Models\InventoryScheduling;
use App\Models\UnitOrDepartment;
use App\Models\Building;
use App\Models\BuildingRoom;
use App\Models\User;
use App\Models\InventorySchedulingSignatory; // 👈 add this
use App\Models\InventoryList; // 👈 your assets model

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class InventorySchedulingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
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
        $buildingRooms = BuildingRoom::with('subAreas')->get();
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
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'scope_type'                => ['required', Rule::in(['unit', 'building'])],
            'unit_ids'                  => ['array'],
            'unit_ids.*'                => ['integer', Rule::exists('unit_or_departments', 'id')],
            'building_ids'              => ['array'],
            'building_ids.*'            => ['integer', Rule::exists('buildings', 'id')],
            'room_ids'                  => ['array'],
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
                'prepared_by_id' => Auth::id(),
                'inventory_schedule' => $data['inventory_schedule'],
                'actual_date_of_inventory' => $data['actual_date_of_inventory'] ?? null,
                'checked_by' => $data['checked_by'] ?? null,
                'verified_by' => $data['verified_by'] ?? null,
                'received_by' => $data['received_by'] ?? null,
                'scheduling_status' => $data['scheduling_status'],
                'description' => $data['description'] ?? null,
                'designated_employee' => $data['designated_employee'] ?? null,
            ]);

            // Attach pivots + fetch assets
            $schedule->syncScopeAndAssets($data);

            return $schedule;
        });

        // Reload relationships for frontend
        $schedule->load([
            'units',
            'buildings',
            'rooms',
            'subAreas',
            'assets.asset',
            'preparedBy',
            'approvals',
            'approvals.steps',
        ]);

        return redirect()->back()->with([
            'success' => 'Schedule added successfully.',
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
            $buildingRooms     = BuildingRoom::with('building')->get();
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
                'assets.asset.buildingRoom',
                'assets.asset.subArea',
            ])->findOrFail($inventory_scheduling->id);

            
    // 👇 compute approval completion flag
  // only require approvals from PMO Head (noted_by) and VP Admin (approved_by)
        $isFullyApproved = $viewing->approvals
            ->flatMap->steps
            ->filter(fn($s) => in_array($s->code, ['noted_by', 'approved_by'])) // only PMO Head + VP Admin
            ->every(fn($s) => $s->status === 'approved');


         // 👇 Fetch assets specific to this building room,
        // and optionally match building + department if provided
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
     * Show the form for editing the specified resource.
     */
    public function edit(InventoryScheduling $inventoryScheduling)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, InventoryScheduling $inventoryScheduling)
    {
        $data = $request->validate([
            'scope_type' => ['required', Rule::in(['unit', 'building'])],
            'unit_ids' => ['array'],
            'unit_ids.*' => ['integer', 'exists:unit_or_departments,id'],
            'building_ids' => ['array'],
            'building_ids.*' => ['integer', 'exists:buildings,id'],
            'room_ids' => ['array'],
            'room_ids.*' => ['integer', 'exists:building_rooms,id'],
            'sub_area_ids' => ['array'],
            'sub_area_ids.*' => ['integer', 'exists:sub_areas,id'],

            'building_id' => ['nullable','integer','exists:buildings,id'],
            'building_room_id' => ['nullable','integer','exists:building_rooms,id'],
            'unit_or_department_id' => ['nullable','integer','exists:unit_or_departments,id'],
            'user_id' => ['nullable','integer','exists:users,id'],
            'designated_employee' => ['nullable','integer','exists:users,id'],
            'assigned_by' => ['nullable','integer','exists:users,id'],
            'inventory_schedule' => ['required','string'],      // "YYYY-MM"
            'actual_date_of_inventory' => ['nullable','date'],  // "YYYY-MM-DD"
            'checked_by' => ['nullable','string'],
            'verified_by' => ['nullable','string'],
            'received_by' => ['nullable','string'],
            'scheduling_status' => ['required','string'],
            'description' => ['nullable','string'],
        ]);

        // Convert '' -> null for nullable FKs
        $data = array_map(fn($v) => $v === '' ? null : $v, $data);

        DB::transaction(function () use ($inventoryScheduling, $data) {
            // Reset approvals if scheduling_status is set to pending_review
            if (strtolower($data['scheduling_status']) === 'pending_review') {
                $inventoryScheduling->approvals()->each(function ($approval) {
                    $approval->resetToPending();
                });
            }

            // Update main record
            $inventoryScheduling->update($data);

            // Sync pivots + assets
            $inventoryScheduling->syncScopeAndAssets($data);
        });

        $inventoryScheduling->load([
            'units',
            'buildings',
            'rooms',
            'subAreas',
            'assets.asset',
            
            'building',
            'unitOrDepartment',
            'buildingRoom',
            'user',
            'designatedEmployee',
            'assignedBy',
            'preparedBy',
            'approvals' => function ($q) {
                $q->with(['steps' => fn ($s) => $s->orderBy('step_order')]); // 👆 reload approvals with full history after update
            },
        ]);

        return back()->with('success', 'Schedule updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(InventoryScheduling $inventoryScheduling)
    {
        $inventoryScheduling->delete();
        return redirect()->back()->with('success', 'The Inventory Schedule Has Been Deleted Successfully.');
    }
}
