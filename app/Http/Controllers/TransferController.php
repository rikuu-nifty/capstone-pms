<?php

namespace App\Http\Controllers;
use Inertia\Inertia;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use App\Models\Transfer;
use App\Models\Building;
use App\Models\BuildingRoom;
use App\Models\InventoryList;
use App\Models\UnitOrDepartment;
use App\Models\User;
use Illuminate\Http\Request;

class TransferController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(?int $id = null)
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
            'transferAssets.asset.assetModel.category',
        ])->latest()->get();

        $buildings = Building::all();
        $buildingRooms = BuildingRoom::with('building')->get();
        $unitOrDepartments = UnitOrDepartment::all();
        $users = User::all();
        $assets = InventoryList::with(['assetModel.category'])
            ->where('status', 'active')
            ->get()
        ;

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

                $array['transferAssets'] = $transfer->transferAssets->map(function ($ta) {
                    return [
                        'id' => $ta->id,
                        'transfer_id' => $ta->transfer_id,
                        'asset_id' => $ta->asset_id,
                        'asset' => $ta->asset,
                    ];
                });

                $array['asset_count'] = $transfer->transferAssets->count();

                return $array;
            }),
            'buildings' => $buildings,
            'buildingRooms' => $buildingRooms,
            'unitOrDepartments' => $unitOrDepartments,
            'users' => $users,
            'currentUser' => $currentUser,
            'assets' => $assets,
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

            'selected_assets' => 'required|array|min:1',
            'selected_assets.*' => 'integer|exists:inventory_lists,id',
        ]);

        $assetIds = $validated['selected_assets'];

        unset(
            $validated['current_building_id'],
            $validated['receiving_building_id'],
            $validated['selected_assets']
        );

        $transfer = DB::transaction(function () use ($validated, $assetIds) {
            $transfer = Transfer::create($validated);

            foreach ($assetIds as $assetId) {
                $transfer->transferAssets()->create([
                    'asset_id' => $assetId,
                ]);
            }

            return $transfer;
        });


        // $transfer = Transfer::create($validated);

        // if ($request->has('selected_assets') && is_array($request->selected_assets)) {
        //     foreach ($request->selected_assets as $assetId) {
        //         $transfer->transferAssets()->create([
        //             'asset_id' => $assetId,
        //         ]);
        //     }
        // }
        

        return back()->with('success', "Transfer #{$transfer->id} created successfully.");
    }

    /**
     * Display the specified resource.
     */
    // public function show(Transfer $transfer)
    // {
    //     $transfer->load([
    //         'currentBuildingRoom.building',
    //         'receivingBuildingRoom.building',
    //         'currentOrganization',
    //         'receivingOrganization',
    //         'designatedEmployee',
    //         'assignedBy',
    //         'transferAssets.asset.assetModel.category',
    //     ]);

    //     $array = $transfer->toArray();
    //     $array['currentBuildingRoom'] = $array['current_building_room'];
    //     $array['currentOrganization'] = $array['current_organization'];
    //     $array['receivingBuildingRoom'] = $array['receiving_building_room'];
    //     $array['receivingOrganization'] = $array['receiving_organization'];
    //     $array['designatedEmployee'] = $array['designated_employee'];
    //     $array['assignedBy'] = $array['assigned_by'];
    //     $array['receivedBy'] = $array['received_by'];
    //     $array['status'] = ucfirst($transfer->status);

    //     $array['transferAssets'] = $transfer->transferAssets->map(function ($ta) {
    //         return [
    //             'id' => $ta->id,
    //             'transfer_id' => $ta->transfer_id,
    //             'asset_id' => $ta->asset_id,
    //             'asset' => $ta->asset,
    //         ];
    //     });

    //     $array['asset_count'] = $transfer->transferAssets->count();

    //     $assets = $transfer->transferAssets->pluck('asset')->map(function ($asset) {
    //         $arr = $asset->toArray();
    //         $arr['assetModel'] = $arr['asset_model'];
    //         $arr['category'] = $arr['asset_model']['category'] ?? null;
    //         return $arr;
    //     })->values();


    //     return Inertia::render('transfer/TransferViewModal', [
    //         'transfer' => $array,
    //         'assets' => $assets,
    //     ]);
    // }

    public function show(int $id)
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
            'transferAssets.asset.assetModel.category',

            'formApproval.steps' => 
                fn($q) => 
                    $q->where('code','approved_by')
                        ->where('status','approved')
                        ->orderByDesc('acted_at'),
            'formApproval.steps.actor:id,name',
        ])->latest()->get();

        $buildings = Building::all();
        $buildingRooms = BuildingRoom::with('building')->get();
        $unitOrDepartments = UnitOrDepartment::all();
        $users = User::all();
        $assets = InventoryList::with(['assetModel.category'])->where('status', 'active')->get();

        $viewingModel = Transfer::findForView($id);
        $viewing_assets = $viewingModel->viewingAssets();

        $viewing = (function ($t) {
            $array = $t->toArray();
            $array['currentBuildingRoom']   = $array['current_building_room'];
            $array['currentOrganization']   = $array['current_organization'];
            $array['receivingBuildingRoom'] = $array['receiving_building_room'];
            $array['receivingOrganization'] = $array['receiving_organization'];
            $array['designatedEmployee']    = $array['designated_employee'];
            $array['assignedBy']            = $array['assigned_by'];
            $array['status']                = ucfirst($t->status);

            $array['transferAssets'] = $t->transferAssets->map(function ($ta) {
                return [
                    'id'          => $ta->id,
                    'transfer_id' => $ta->transfer_id,
                    'asset_id'    => $ta->asset_id,
                    'asset'       => $ta->asset,
                ];
            })->values();

            $array['asset_count'] = $t->transferAssets->count();

            return $array;
        })($viewingModel);

        return Inertia::render('transfer/index', [
            'transfers' => $transfers->map(function ($transfer) {
                $array = $transfer->toArray();
                $array['currentBuildingRoom']   = $array['current_building_room'];
                $array['currentOrganization']   = $array['current_organization'];
                $array['receivingBuildingRoom'] = $array['receiving_building_room'];
                $array['receivingOrganization'] = $array['receiving_organization'];
                $array['designatedEmployee']    = $array['designated_employee'];
                $array['assignedBy']            = $array['assigned_by'];
                $array['status']                = ucfirst($transfer->status);
                $array['transferAssets']        = $transfer->transferAssets->map(function ($ta) {
                    return [
                        'id'          => $ta->id,
                        'transfer_id' => $ta->transfer_id,
                        'asset_id'    => $ta->asset_id,
                        'asset'       => $ta->asset,
                    ];
                })->values();
                $array['asset_count'] = $transfer->transferAssets->count();
                return $array;
            }),
            'buildings'         => $buildings,
            'buildingRooms'     => $buildingRooms,
            'unitOrDepartments' => $unitOrDepartments,
            'users'             => $users,
            'currentUser'       => $currentUser,
            'assets'            => $assets,

            'viewing'        => $viewing,
            'viewing_assets' => $viewing_assets,
        ]);
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
        $validated = $request->validate([
            'current_building_room' => 'required|integer|exists:building_rooms,id',
            'current_organization' => 'required|integer|exists:unit_or_departments,id',
            'receiving_building_room' => 'required|integer|exists:building_rooms,id',
            'receiving_organization' => 'required|integer|exists:unit_or_departments,id',
            'designated_employee' => 'required|integer|exists:users,id',
            'assigned_by' => 'required|integer|exists:users,id',
            'scheduled_date' => 'required|date',
            'actual_transfer_date' => 'nullable|date',
            'received_by' => 'nullable|string',
            'status' => 'required|in:upcoming,in_progress,completed,overdue',
            'remarks' => 'nullable|string',

            'selected_assets' => 'nullable|array|min:1',
            'selected_assets.*' => 'integer|exists:inventory_lists,id',
        ]);

        $transfer->update($validated);

        // Sync assets
        $transfer->transferAssets()->delete();

        if ($request->has('selected_assets')) {
            foreach ($request->selected_assets as $assetId) {
                $transfer->transferAssets()->create(['asset_id' => $assetId]);
            }
        }

        return back()->with('success', 'Transfer updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transfer $transfer)
    {
        $transfer->delete(); //soft delete lang
        return redirect()->route('transfers.index')->with('success', 'Transfer record deleted successfully.');
    }
}
