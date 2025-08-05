<?php

namespace App\Http\Controllers;
use Inertia\Inertia;

use Illuminate\Support\Facades\Auth;

use App\Models\Transfer;
use App\Models\Building;
use App\Models\BuildingRoom;
use App\Models\UnitOrDepartment;
use App\Models\User;
use Illuminate\Http\Request;

class TransferController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $currentUser = Auth::user();

        $transfers = Transfer::with([
            'currentBuildingRoom',
            'currentBuildingRoom.building',
            'currentOrganization',
            'receivingBuildingRoom',
            'receivingBuildingRoom.building',
            'receivingOrganization',
            'designatedEmployee',
            'assignedBy',
            'transferAssets',
        ])->latest()->get();

        $buildings = Building::all();
        $buildingRooms = BuildingRoom::with('building')->get();
        $unitOrDepartments = UnitOrDepartment::all();
        $users = User::all();

        return Inertia::render('transfer/index', [
            'transfers' => $transfers->map(function ($transfer) {
                $array = $transfer->toArray();
                $array['currentBuildingRoom'] = $array['current_building_room'];
                $array['currentOrganization'] = $array['current_organization'];
                $array['receivingBuildingRoom'] = $array['receiving_building_room'];
                $array['receivingOrganization'] = $array['receiving_organization'];
                $array['designatedEmployee'] = $array['designated_employee'];
                $array['assignedBy'] = $array['assigned_by'];
                $array['status'] = ucfirst($transfer->status);

                $array['asset_count'] = $transfer->transferAssets->count();
                // $array['assets'] = $transfer->transferAsset->pluck('inventoryList');
                /* gives full list of related asset records */

                return $array;
            }),
            'buildings' => $buildings,
            'buildingRooms' => $buildingRooms,
            'unitOrDepartments' => $unitOrDepartments,
            'users' => $users,
            'currentUser' => $currentUser,
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
        $validated = $request->validate([
            'current_building_id' => 'required|integer|exists:buildings,id',
            'current_building_room' => 'required|integer|exists:building_rooms,id',
            'current_organization' => 'required|integer|exists:unit_or_departments,id',
            'receiving_building_id' => 'required|integer|exists:buildings,id',
            'receiving_building_room' => 'required|integer|exists:building_rooms,id',
            'receiving_organization' => 'required|integer|exists:unit_or_departments,id',
            'designated_employee' => 'required|integer|exists:users,id',
            'assigned_by' => 'required|integer|exists:users,id',
            'scheduled_date' => 'required|date',
            'actual_transfer_date' => 'nullable|date',
            'received_by' => 'nullable|string',
            'status' => 'required|in:upcoming,in_progress,completed,overdue',
            'remarks' => 'nullable|string',
        ]);

        unset($validated['current_building_id'], $validated['receiving_building_id']);

        Transfer::create($validated);

        return back()->with('success', 'Transfer created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Transfer $transfer)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Transfer $transfer)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Transfer $transfer)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transfer $transfer)
    {
        //
    }
}
