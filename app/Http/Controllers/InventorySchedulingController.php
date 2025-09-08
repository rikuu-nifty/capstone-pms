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

use Illuminate\Http\Request;

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
            'preparedBy',     // 👈 include preparer relationship
            // keep approvals lightweight here (pending-only, handled in FormApprovalController)
        ])->latest()->get();

        $buildings = Building::all();
        $buildingRooms = BuildingRoom::all();
        $unitOrDepartments = UnitOrDepartment::all();
        $users = User::all();

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
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Get validated input
        $data = $request->all();
        // $data = $request->validated();

        // 👇 assign current logged-in user as preparer
        $data['prepared_by_id'] = auth()->id();

        // Save to database
        $schedule = InventoryScheduling::create($data);

        // Load FK relationships so frontend gets complete data
        $schedule->load([
            'building',
            'unitOrDepartment',
            'buildingRoom',
            'user',
            'designatedEmployee',
            'assignedBy',
            'preparedBy',     // 👈 include preparer
            'approvals',      // 👈 include approvals
            'approvals.steps' // 👈 load approvals as well
        ]);

        // Redirect back with success message and new schedule
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
        ])->findOrFail($inventory_scheduling->id);

        // also load signatories
        $signatories = InventorySchedulingSignatory::all()->keyBy('role_key');

        return Inertia::render('inventory-scheduling/index', [
            'schedules'         => $schedules, 
            'buildings'         => $buildings,
            'buildingRooms'     => $buildingRooms,
            'unitOrDepartments' => $unitOrDepartments,
            'users'             => $users,

            'viewing'           => $viewing,      // 👈 now provided with full approvals
            'signatories'       => $signatories,  // 👈 now provided

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

         // 👇 Special case: if scheduling_status set to Pending_Review, reset approvals
    if (strtolower($data['scheduling_status']) === 'pending_review') {
        $inventoryScheduling->approvals()->each(function ($approval) {
            $approval->resetToPending(); // 👈 resets all approval steps
        });
    }

        $inventoryScheduling->update($data);

        $inventoryScheduling->load([
            'building',
            'unitOrDepartment',
            'buildingRoom',
            'user',
            'designatedEmployee',
            'assignedBy',
            'preparedBy',
            'approvals' => function ($q) {
                $q->with(['steps' => fn ($s) => $s->orderBy('step_order')]); 
                // 👆 reload approvals with full history after update
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
