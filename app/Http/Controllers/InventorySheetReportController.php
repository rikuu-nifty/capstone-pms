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

        // 🔹 Transform each asset
        $assets = $assets->map(function ($asset) {
            $quantity = 1;
            $remarks = 'Available';

            // --- Turnover/Disposal ---
            if ($asset->turnoverDisposalAsset()->exists()) {
                $latest = $asset->turnoverDisposalAsset()->latest()->first();
                if ($latest && $latest->turnoverDisposal) {
                    $quantity = 0;
                    $type = $latest->turnoverDisposal->type;
                    $date = optional($latest->turnoverDisposal->document_date)->format('M d, Y');
                    $remarks = $type === 'disposal'
                        ? "Disposed on {$date}"
                        : "Turned Over on {$date}";
                }
            }

            // --- Transfer ---
            elseif ($asset->transferAssets()->exists()) {
                $latest = $asset->transferAssets()->latest()->first();
                if ($latest) {
                    $quantity = 0;
                    $toSub = $latest->toSubArea?->name;
                    $toRoom = $latest->transfer?->receivingBuildingRoom?->room;
                    $toBuilding = $latest->transfer?->receivingBuildingRoom?->building?->name;
                    $location = $toSub ?: ($toRoom ? "{$toRoom}, {$toBuilding}" : $toBuilding);
                    $date = optional($latest->moved_at)->format('M d, Y');
                    $remarks = "Transferred to {$location} on {$date}";
                }
            }

            // --- Off-Campus ---
            elseif ($asset->offCampusAssets()->exists()) {
                $latest = $asset->offCampusAssets()->latest()->first();
                if ($latest && $latest->offCampus) {
                    $quantity = 0;
                    $date = optional($latest->offCampus->date_issued)->format('M d, Y');
                    $remarks = $latest->offCampus->remarks === 'repair'
                        ? "For Repair (Issued {$date})"
                        : "Off-Campus – {$latest->offCampus->purpose} ({$date})";
                }
            }

            // --- NFC Inventory Status ---
            $inventoryStatus = $asset->resolveInventoryStatus();

            return [
                'id'               => $asset->id,
                'asset_name'       => $asset->asset_name,
                'asset_type'       => $asset->asset_type,
                'sub_area'         => $asset->subArea?->name,
                'quantity'         => $quantity,
                'status'           => $remarks,
                'inventory_status' => $inventoryStatus,
            ];
        })->toArray();

        // 🔹 Chart Data (group by status for now)
        $chartData = collect($assets)
            ->groupBy('status')
            ->map(fn($group, $label) => [
                'label' => $label,
                'value' => count($group),
            ])
            ->values()
            ->all(); // ✅ ensure plain array

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
