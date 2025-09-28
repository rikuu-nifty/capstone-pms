<?php

namespace App\Http\Controllers;

use App\Models\InventorySchedulingSignatory;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\InventoryScheduling;
use App\Models\Building;
use App\Models\BuildingRoom;
use App\Models\UnitOrDepartment;
use App\Models\User;

class InventorySchedulingSignatoryController extends Controller
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

        $signatories = InventorySchedulingSignatory::all()
            ->keyBy('role_key'); // easier to access by key

        return Inertia::render('inventory-scheduling/index', [
            'schedules'    => $schedules,
            'signatories'  => $signatories,
            'buildings'    => Building::all(),
            'buildingRooms'=> BuildingRoom::all(),
            'unitOrDepartments' => UnitOrDepartment::all(),
            'users'        => User::all(),
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(InventorySchedulingSignatory $inventorySchedulingSignatory)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(InventorySchedulingSignatory $inventorySchedulingSignatory)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, InventorySchedulingSignatory $inventorySchedulingSignatory)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(InventorySchedulingSignatory $inventorySchedulingSignatory)
    {
        //
    }
}
