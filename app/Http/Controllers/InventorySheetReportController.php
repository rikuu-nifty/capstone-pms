<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\UnitOrDepartment;
use App\Models\BuildingRoom;
use App\Models\SubArea;
use App\Models\InventoryList;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventorySheetReportController extends Controller
{
    public function index(Request $request)
    {
        // Filters
        $buildingId = $request->building_id;
        $deptId     = $request->department_id;
        $roomId     = $request->room_id;
        $subAreaId  = $request->sub_area_id;

        // 🔹 Base query
        $query = InventoryList::with([
            'subArea',
            'building',
            'buildingRoom',
            'unitOrDepartment',
            'transfers',
            'transferAssets.transfer.receivingBuildingRoom.building',
            'turnoverDisposalAsset.turnoverDisposal',
            'offCampusAssets.offCampus',
            'schedulingAssets',
        ])
            ->when($buildingId, fn($q) => $q->where('building_id', $buildingId))
            ->when($deptId, fn($q) => $q->where('unit_or_department_id', $deptId))
            ->when($roomId, fn($q) => $q->where('building_room_id', $roomId))
            ->when($subAreaId, fn($q) => $q->where('sub_area_id', $subAreaId));

        $assets = $query->get();

        $assets = $assets->map(function ($asset) {
            $quantity = 1;
            $status = 'Available';

            // --- Turnover/Disposal (final state) ---
            $td = $asset->turnoverDisposalAsset()->latest()->first();
            if ($td && $td->turnoverDisposal) {
                $quantity = 0;
                $type = $td->turnoverDisposal->type; // 'turnover' | 'disposal'
                $date = optional($td->turnoverDisposal->document_date)->format('M d, Y');
                $status = $type === 'disposal' ? "Disposed on {$date}" : "Turned Over on {$date}";
            } else {
                // --- Transfer ---
                $tr = $asset->transferAssets()->latest()->first();
                if ($tr) {
                    $quantity = 0;
                    $toSub  = optional($tr->toSubArea)->name;
                    $toRoom = optional(optional($tr->transfer)->receivingBuildingRoom)->room;
                    $toBldg = optional(optional(optional($tr->transfer)->receivingBuildingRoom)->building)->name;

                    $dest = $toSub ?: ($toRoom ? "{$toRoom}, {$toBldg}" : $toBldg);
                    $date = optional($tr->moved_at)->format('M d, Y');
                    $status = $dest ? "Transferred to {$dest} on {$date}" : "Transferred on {$date}";
                } else {
                    // --- Off-Campus (includes 'repair') ---
                    $oc = $asset->offCampusAssets()->latest()->first();
                    if ($oc && $oc->offCampus) {
                        $quantity = 0;
                        $date = optional($oc->offCampus->date_issued)->format('M d, Y');
                        // remarks column on off_campuses is enum ['official_use','repair']
                        $status = $oc->offCampus->remarks === 'repair'
                            ? "For Repair (Issued {$date})"
                            : "Off-Campus – {$oc->offCampus->purpose} ({$date})";
                    }
                }
            }

            // NFC view helper (Already Inventoried / Scheduled / Not Yet Inventoried)
            $inventoryStatus = $asset->resolveInventoryStatus();

            return [
                'id'               => $asset->id,
                'asset_name'       => $asset->asset_name,
                'asset_type'       => $asset->asset_type,
                'sub_area'         => optional($asset->subArea)->name,
                'quantity'         => $quantity,
                'status'           => $status,
                'inventory_status' => $inventoryStatus,
            ];
        })->toArray();

        // group chart by status (can change later to sub_area/room if you want)
        $chartData = collect($assets)
            ->groupBy('status')
            ->map(fn($g, $label) => ['label' => $label, 'value' => $g->count()])
            ->values()
            ->all();

        return Inertia::render('reports/InventorySheetReport', [
            'buildings'   => Building::select('id', 'name')->get(),
            'departments' => UnitOrDepartment::select('id', 'name')->get(),
            'rooms'       => BuildingRoom::select('id', 'room', 'building_id')->get(),
            'subAreas'    => SubArea::select('id', 'name', 'building_room_id')->get(),
            'assets'      => $assets,
            'chartData'   => $chartData,
        ]);
    }
}
