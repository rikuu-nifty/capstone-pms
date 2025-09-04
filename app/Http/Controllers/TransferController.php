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
     * Store a newly created resource.
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
            'status' => 'required|in:pending_review,upcoming,in_progress,completed,overdue,cancelled',
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
                // ✅ Create transfer asset
                $transfer->transferAssets()->create([
                    'asset_id' => $assetId,
                ]);

                // ✅ Update inventory list with transfer_id
                InventoryList::where('id', $assetId)->update([
                    'transfer_id' => $transfer->id,
                ]);
            }

            $this->syncAssetLocations($transfer, null);

            return $transfer;
        });

        return back()->with('success', "Transfer #{$transfer->id} created successfully.");
    }

    /**
     * Display the specified resource.
     */
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
     * Update the specified resource.
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
            'status' => 'required|in:pending_review,upcoming,in_progress,completed,overdue,cancelled',
            'remarks' => 'nullable|string',
            'selected_assets' => 'nullable|array|min:1',
            'selected_assets.*' => 'integer|exists:inventory_lists,id',
        ]);

        DB::transaction(function () use ($transfer, $request, $validated) {
            $oldStatus = $transfer->status;
            $transfer->update($validated);

            // Sync assets
            $transfer->transferAssets()->delete();
            if ($request->has('selected_assets')) {
                foreach ($request->selected_assets as $assetId) {
                    $transfer->transferAssets()->create(['asset_id' => $assetId]);

                    // ✅ Update inventory list with transfer_id
                    InventoryList::where('id', $assetId)->update([
                        'transfer_id' => $transfer->id,
                    ]);
                }
            }

            $this->syncAssetLocations($transfer, $oldStatus);
        });

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

    private function syncAssetLocations(Transfer $transfer, ?string $oldStatus): void
    {
        if ($transfer->status === 'completed' && $oldStatus !== 'completed') {
            foreach ($transfer->transferAssets as $ta) {
                $asset = $ta->asset;
                if ($asset) {
                    $asset->update([
                        'building_id'            => $transfer->receivingBuildingRoom->building_id,
                        'building_room_id'       => $transfer->receiving_building_room,
                        'unit_or_department_id'  => $transfer->receiving_organization,
                    ]);
                }
            }
        }

        if ($oldStatus === 'completed' && $transfer->status !== 'completed') {
            foreach ($transfer->transferAssets as $ta) {
                $asset = $ta->asset;
                if ($asset) {
                    $asset->update([
                        'building_id'            => $transfer->currentBuildingRoom->building_id,
                        'building_room_id'       => $transfer->current_building_room,
                        'unit_or_department_id'  => $transfer->current_organization,
                    ]);
                }
            }
        }
    }
}
