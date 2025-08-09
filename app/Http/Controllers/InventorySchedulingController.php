<?php

namespace App\Http\Controllers;
// use App\Http\Requests\InventoryListAddNewAssetFormRequest;
use Inertia\Inertia;
use App\Models\InventoryScheduling;
use App\Models\UnitOrDepartment;
use App\Models\Building;
use App\Models\BuildingRoom;
use App\Models\User;

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
        ])->latest()->get();

        $buildings = Building::all();
        $buildingRooms = BuildingRoom::all();
        $unitOrDepartments = UnitOrDepartment::all();
        $users = User::all();

        return Inertia::render('inventory-scheduling/index', [
            'schedules' => $schedules,
            'buildings' => $buildings,
            'buildingRooms' => $buildingRooms,
            'unitOrDepartments' => $unitOrDepartments,
            'users' => $users,
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
    public function show(InventoryScheduling $inventoryScheduling)
    {
        //
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

    $inventoryScheduling->update($data);

    $inventoryScheduling->load([
        'building','unitOrDepartment','buildingRoom','user','designatedEmployee','assignedBy',
    ]);

    return back()->with('success', 'Schedule updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(InventoryScheduling $inventoryScheduling)
    {
        //
    }
}
