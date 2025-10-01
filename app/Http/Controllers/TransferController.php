<?php

namespace App\Http\Controllers;
use Inertia\Inertia;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

use App\Models\Transfer;
use App\Models\Building;
use App\Models\BuildingRoom;
use App\Models\InventoryList;
use App\Models\UnitOrDepartment;
use App\Models\User;
use App\Models\SubArea;
use App\Models\TransferSignatory; // ✅ import transfer signatories

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
            'transferAssets.asset.assetModel.equipmentCode',

            'transferAssets.fromSubArea',
            'transferAssets.toSubArea',
            'formApproval',
        ])->latest()->get();

        $buildings = Building::all();
        $buildingRooms = BuildingRoom::with('building')->get();
        $unitOrDepartments = UnitOrDepartment::all();
        $users = User::all();
        $assets = InventoryList::with(['assetModel.category'])
            ->where('status', 'active')
            ->get();
        $subAreas = SubArea::all();

        // ✅ Fetch official transfer signatories (keyed by role_key)
        $signatories = TransferSignatory::all()->keyBy('role_key');

        return Inertia::render('transfer/index', [
            'transfers' => $transfers->map(function ($transfer) {
                $array = $transfer->toArray();
                $array['scheduled_date'] = $transfer->scheduled_date
                    ? $transfer->scheduled_date->toDateString()
                    : null;

                $array['actual_transfer_date'] = $transfer->actual_transfer_date
                    ? $transfer->actual_transfer_date->toDateString()
                    : null;

                $array['currentBuildingRoom']   = $array['current_building_room'];
                $array['currentOrganization']   = $array['current_organization'];
                $array['receivingBuildingRoom'] = $array['receiving_building_room'];
                $array['receivingOrganization'] = $array['receiving_organization'];
                $array['designatedEmployee']    = $array['designated_employee'];
                $array['assignedBy']            = $array['assigned_by'];
                $array['status']                = ucfirst($transfer->status);

                $array['transferAssets'] = $transfer->transferAssets->map(function ($ta) {
                    return [
                        'id' => $ta->id,
                        'transfer_id' => $ta->transfer_id,
                        'asset_id' => $ta->asset_id,
                        'asset' => $ta->asset,

                        'moved_at'               => $ta->moved_at ? $ta->moved_at->toDateString() : null,
                        'from_sub_area_id'       => $ta->from_sub_area_id,
                        'to_sub_area_id'         => $ta->to_sub_area_id,
                        'asset_transfer_status'  => $ta->asset_transfer_status,
                        'remarks'                => $ta->remarks,

                        'fromSubArea'            => $ta->fromSubArea ? $ta->fromSubArea->only(['id', 'name']) : null,
                        'toSubArea'              => $ta->toSubArea ? $ta->toSubArea->only(['id', 'name']) : null,
                    ];
                })->values();

                $array['asset_count'] = $transfer->transferAssets->count();

                $array['is_approved'] = $transfer->formApproval
                    ? $transfer->formApproval->status === 'approved'
                    : false;

                return $array;
            }),
            'buildings' => $buildings,
            'buildingRooms' => $buildingRooms,
            'unitOrDepartments' => $unitOrDepartments,
            'users' => $users,
            'currentUser' => $currentUser,
            'assets' => $assets,
            'subAreas' => $subAreas,

            'signatories' => $signatories, // ✅ pass to frontend
            'totals'   => Transfer::kpiStats(),
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
            'current_building_id'     => 'required|integer|exists:buildings,id',
            'current_building_room'   => 'required|integer|exists:building_rooms,id',
            'current_organization'    => 'required|integer|exists:unit_or_departments,id',
            'receiving_building_id'   => 'required|integer|exists:buildings,id',
            'receiving_building_room' => 'required|integer|exists:building_rooms,id',
            'receiving_organization'  => 'required|integer|exists:unit_or_departments,id',
            'designated_employee'     => 'required|integer|exists:users,id',
            'assigned_by'             => 'required|integer|exists:users,id',
            'scheduled_date'          => 'required|date',
            'actual_transfer_date'    => 'nullable|date',
            'received_by'             => 'nullable|string',
            'status'                  => 'required|in:pending_review,upcoming,in_progress,completed,overdue,cancelled',
            'remarks'                 => 'nullable|string',

            // rich pivot array
            'transfer_assets'                         => 'required|array|min:1',
            'transfer_assets.*.asset_id'              => 'required|integer|exists:inventory_lists,id',
            // 'transfer_assets.*.moved_at'              => 'nullable|date',
            'transfer_assets.*.from_sub_area_id'      => 'nullable|integer|exists:sub_areas,id',
            'transfer_assets.*.to_sub_area_id'        => 'nullable|integer|exists:sub_areas,id',
            // 'transfer_assets.*.asset_transfer_status' => 'nullable|in:pending,transferred,cancelled',
            // 'transfer_assets.*.remarks'               => 'nullable|string',
        ]);

        // these are only used by the UI for filtering; not persisted on Transfer
        unset($validated['current_building_id'], $validated['receiving_building_id']);

        $pivotRows = $validated['transfer_assets'];
        unset($validated['transfer_assets']);

        $transfer = DB::transaction(function () use ($validated, $pivotRows) {
            /** @var \App\Models\Transfer $transfer */
            $transfer = Transfer::create($validated);

            foreach ($pivotRows as $row) {
                $transfer->transferAssets()->create([
                    'asset_id'               => $row['asset_id'],
                    // 'moved_at'               => $row['moved_at'] ?? null,
                    'from_sub_area_id'       => $row['from_sub_area_id'] ?? null,
                    'to_sub_area_id'         => $row['to_sub_area_id'] ?? null,
                    'asset_transfer_status'  => 'pending',
                    // 'remarks'                => $row['remarks'] ?? null,
                ]);

                // keep your existing behavior: tag the inventory row with this transfer_id
                InventoryList::where('id', $row['asset_id'])->update([
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
        'transferAssets.asset.assetModel.equipmentCode',
        
        'formApproval',
        'formApproval.steps' => 
            fn($q) => 
                $q->where('code','approved_by')
                    ->where('status','approved')
                    ->orderByDesc('acted_at'),
        'formApproval.steps.actor:id,name,role_id',
        'formApproval.steps.actor.role:id,name',

        'transferAssets.fromSubArea',
        'transferAssets.toSubArea',
    ])->latest()->get();

    $buildings         = Building::all();
    $buildingRooms     = BuildingRoom::with('building')->get();
    $unitOrDepartments = UnitOrDepartment::all();
    $users             = User::all();
    $assets            = InventoryList::with(['assetModel.category'])
                            ->where('status', 'active')
                            ->get();
    $subAreas          = SubArea::all();

    $viewingModel   = Transfer::findForView($id);
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
        $array['scheduled_date']        = $t->scheduled_date
            ? $t->scheduled_date->toDateString()
            : null;
        $array['actual_transfer_date']  = $t->actual_transfer_date
            ? $t->actual_transfer_date->toDateString()
            : null;
        
        $array['transferAssets'] = $t->transferAssets->map(function ($ta) {
            return [
                'id'                   => $ta->id,
                'transfer_id'          => $ta->transfer_id,
                'asset_id'             => $ta->asset_id,
                'asset'                => $ta->asset,

                'moved_at'             => $ta->moved_at ? $ta->moved_at->toDateString() : null,
                'from_sub_area_id'     => $ta->from_sub_area_id,
                'to_sub_area_id'       => $ta->to_sub_area_id,
                'asset_transfer_status'=> $ta->asset_transfer_status,
                'remarks'              => $ta->remarks,

                'fromSubArea'          => $ta->fromSubArea ? $ta->fromSubArea->only(['id', 'name']) : null,
                'toSubArea'            => $ta->toSubArea ? $ta->toSubArea->only(['id', 'name']) : null,
            ];
        })->values();

        $array['asset_count']  = $t->transferAssets->count();
        $array['is_approved']  = $t->formApproval?->status === 'approved';

        // ✅ flatten approvals
        $array['approvals'] = $t->formApproval && $t->formApproval->steps
            ? $t->formApproval->steps->map(fn($s) => [
                'id'       => $s->id,
                'code'     => $s->code,
                'status'   => $s->status,
                'acted_at' => $s->acted_at,
                'actor_id' => $s->actor_id,
                'actor'    => $s->actor?->only(['id','name']),
            ])->values()->toArray()
            : [];
        
        return $array;
    })($viewingModel);

    // ✅ Fetch official transfer signatories (keyed by role_key)
    $signatories = \App\Models\TransferSignatory::all()->keyBy('role_key');

    return Inertia::render('transfer/index', [
        'transfers'        => $transfers->map(function ($transfer) {
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
                    'id'                   => $ta->id,
                    'transfer_id'          => $ta->transfer_id,
                    'asset_id'             => $ta->asset_id,
                    'asset'                => $ta->asset,

                    'moved_at'             => $ta->moved_at ? $ta->moved_at->toDateString() : null,
                    'from_sub_area_id'     => $ta->from_sub_area_id,
                    'to_sub_area_id'       => $ta->to_sub_area_id,
                    'asset_transfer_status'=> $ta->asset_transfer_status,
                    'remarks'              => $ta->remarks,
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
        'subAreas'          => $subAreas,

        'viewing'        => $viewing,
        'viewing_assets' => $viewing_assets,

        'signatories'    => $signatories, // ✅ now always passed to frontend
    ]);
}



    /**
     * Update the specified resource.
     */
    public function update(Request $request, Transfer $transfer)
    {
        $validated = $request->validate([
            'current_building_room'   => 'required|integer|exists:building_rooms,id',
            'current_organization'    => 'required|integer|exists:unit_or_departments,id',
            'receiving_building_room' => 'required|integer|exists:building_rooms,id',
            'receiving_organization'  => 'required|integer|exists:unit_or_departments,id',
            'designated_employee'     => 'required|integer|exists:users,id',
            'assigned_by'             => 'required|integer|exists:users,id',
            'scheduled_date'          => 'required|date',
            'actual_transfer_date'    => 'nullable|date',
            'received_by'             => 'nullable|string',
            'status'                  => 'required|in:pending_review,upcoming,in_progress,completed,overdue,cancelled',
            'remarks'                 => 'nullable|string',

            // NEW: rich pivot array (allow empty only if you want to permit “header-only” edit)
            'transfer_assets'                         => 'required|array|min:1',
            'transfer_assets.*.asset_id'              => 'required|integer|exists:inventory_lists,id',
            // 'transfer_assets.*.moved_at'              => 'nullable|date',
            'transfer_assets.*.from_sub_area_id'      => 'nullable|integer|exists:sub_areas,id',
            'transfer_assets.*.to_sub_area_id'        => 'nullable|integer|exists:sub_areas,id',
            // 'transfer_assets.*.asset_transfer_status' => 'nullable|in:pending,transferred,cancelled',
            // 'transfer_assets.*.remarks'               => 'nullable|string',
        ]);

        // Block status updates unless approved
        if ($transfer->formApproval && $transfer->formApproval->status !== 'approved') {
            // keep existing status from DB
            $validated['status'] = $transfer->status;
        }

        DB::transaction(function () use ($transfer, $validated) {
            $oldStatus = $transfer->status;

            $pivotRows = $validated['transfer_assets'];
            unset($validated['transfer_assets']);

            $transfer->update($validated);

            // simple + reliable: replace all pivot rows from the payload
            $transfer->transferAssets()->delete();

            foreach ($pivotRows as $row) {
                $transfer->transferAssets()->create([
                    'asset_id'               => $row['asset_id'],
                    // 'moved_at'               => $row['moved_at'] ?? null,
                    'from_sub_area_id'       => $row['from_sub_area_id'] ?? null,
                    'to_sub_area_id'         => $row['to_sub_area_id'] ?? null,
                    'asset_transfer_status'  => 'pending',
                    // 'remarks'                => $row['remarks'] ?? null,
                ]);

                // keep your existing behavior
                InventoryList::where('id', $row['asset_id'])->update([
                    'transfer_id' => $transfer->id,
                ]);
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
        // Asset-level immediate update ---
        foreach ($transfer->transferAssets as $ta) {
            $asset = $ta->asset;
            if (!$asset) continue;

            if ($ta->asset_transfer_status === 'transferred') {
                $ta->update(['moved_at' => now()]);

                $asset->update([
                    'building_id'           => $transfer->receivingBuildingRoom->building_id,
                    'building_room_id'      => $transfer->receiving_building_room,
                    'unit_or_department_id' => $transfer->receiving_organization,
                    'sub_area_id'           => $ta->to_sub_area_id ?? $asset->sub_area_id,
                ]);
            }
        }

        // Form set to completed => mark all as transferred ---
        if ($transfer->status === 'completed' && $oldStatus !== 'completed') {
            foreach ($transfer->transferAssets as $ta) {
                // if ($ta->asset_transfer_status !== 'transferred') {
                //     $ta->update([
                //         'asset_transfer_status' => 'transferred',
                //         'moved_at'              => now(),
                //     ]);
                // } else {
                //     $ta->update(['moved_at' => now()]);
                // }
                $movedDate = $transfer->actual_transfer_date ?? now();

                $ta->update([
                    'asset_transfer_status' => 'transferred',
                    'moved_at'              => $movedDate,
                    'remarks'               => $transfer->remarks, //copying remarks from transfers instead
                ]);

                $ta->asset?->update([
                    'building_id'           => $transfer->receivingBuildingRoom->building_id,
                    'building_room_id'      => $transfer->receiving_building_room,
                    'unit_or_department_id' => $transfer->receiving_organization,
                    'sub_area_id'           => $ta->to_sub_area_id ?? $ta->asset->sub_area_id,
                ]);
            }
        }

        // Form set to cancelled => cascade pending → cancelled
        if ($transfer->status === 'cancelled' && $oldStatus !== 'cancelled') {
            foreach ($transfer->transferAssets as $ta) {
                if ($ta->asset_transfer_status !== 'transferred') {
                    $ta->update([
                        'asset_transfer_status' => 'cancelled',
                        'moved_at'              => null,
                    ]);
                }
            }
        }

        // Form set to pending_review => revert asset statuses & locations ---
        if (in_array($transfer->status, ['pending_review', 'upcoming']) && $oldStatus !== $transfer->status) {
            foreach ($transfer->transferAssets as $ta) {
                if ($ta->asset_transfer_status === 'transferred') {
                    $ta->update([
                        'asset_transfer_status' => 'pending',
                        'moved_at'              => null,
                        'remarks'               => null,
                    ]);

                    $ta->asset?->update([
                        'building_id'           => $transfer->currentBuildingRoom->building_id,
                        'building_room_id'      => $transfer->current_building_room,
                        'unit_or_department_id' => $transfer->current_organization,
                        'sub_area_id' => $ta->from_sub_area_id,
                    ]);
                }
            }
        }

        // Rollback if transfer is completed but some assets reverted ---
        if ($oldStatus === 'completed' || $transfer->status === 'completed') {
            $hasNonTransferred = $transfer->transferAssets
                ->contains(fn($ta) => $ta->asset_transfer_status !== 'transferred');

            if ($hasNonTransferred) {
                $transfer->update([
                    'status' => 'in_progress'
                ]);

                // Roll back locations only for reverted assets
                foreach ($transfer->transferAssets as $ta) {
                    if ($ta->asset_transfer_status !== 'transferred') {
                        $updates = [
                            'building_id'           => $transfer->currentBuildingRoom->building_id,
                            'building_room_id'      => $transfer->current_building_room,
                            'unit_or_department_id' => $transfer->current_organization,
                            'sub_area_id' => $ta->from_sub_area_id,
                        ];

                        if ($ta->asset_transfer_status === 'pending') {
                            $ta->update([
                                'moved_at' => null,
                                'remarks'  => null, // clear remarks when reverted to pending
                            ]);
                        } elseif ($ta->asset_transfer_status === 'cancelled') {
                            $ta->update([
                                'moved_at' => null,
                            ]);
                        }

                        $ta->asset?->update($updates);
                    }
                }
            }
        }

        $assets = $transfer->transferAssets;

        $allTransferred = $assets->every(fn($ta) => $ta->asset_transfer_status === 'transferred');
        $allCancelled   = $assets->every(fn($ta) => $ta->asset_transfer_status === 'cancelled');
        $hasPending     = $assets->contains(fn($ta) => $ta->asset_transfer_status === 'pending');

        // --- Auto-status resolution (skip if user explicitly set upcoming/pending_review) ---
        if (! in_array($transfer->status, ['upcoming', 'pending_review'])) {
            if ($allTransferred) {
                // every asset transferred
                $transfer->update(['status' => 'completed']);

            } elseif ($allCancelled) {
                // every asset cancelled
                $transfer->update(['status' => 'cancelled']);

            } elseif (!$hasPending) {
                // mixed: some transferred, some cancelled → not completed, not cancelled → in progress
                $transfer->update(['status' => 'in_progress']);

            } elseif ($hasPending) {
                if ($oldStatus === 'completed') {
                    // reverted from completed → check overdue vs in_progress
                    if ($transfer->scheduled_date && $transfer->scheduled_date < now()) {
                        $transfer->update(['status' => 'overdue']);
                    } else {
                        $transfer->update(['status' => 'in_progress']);
                    }
                } elseif ($transfer->scheduled_date && $transfer->scheduled_date < now()) {
                    // normal overdue case
                    $transfer->update(['status' => 'overdue']);
                } else {
                    // still active but with pending → in progress
                    $transfer->update(['status' => 'in_progress']);
                }
            }
        }


        foreach ($transfer->transferAssets as $ta) {
            $asset = $ta->asset;
            if (!$asset) continue;

            if ($ta->asset_transfer_status !== 'transferred') {
                $asset->update([
                    'building_id'           => $transfer->currentBuildingRoom->building_id,
                    'building_room_id'      => $transfer->current_building_room,
                    'unit_or_department_id' => $transfer->current_organization,
                    'sub_area_id'           => $ta->from_sub_area_id,
                ]);
            }
        }
    }
}
