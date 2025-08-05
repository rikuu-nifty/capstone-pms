<?php

namespace App\Http\Controllers;
use Inertia\Inertia;

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
