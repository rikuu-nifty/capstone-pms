<?php

// app/Http/Controllers/InventoryReportController.php
namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\UnitOrDepartment;
use App\Models\BuildingRoom;
use App\Models\SubArea;
use App\Models\InventoryList;
use App\Models\Transfer;
use App\Models\TurnoverDisposalAsset;
use App\Models\OffCampusAsset;
use Inertia\Inertia;
use Illuminate\Http\Request;

class InventoryReportController extends Controller
{
    public function index()
    {
        return Inertia::render('reports/inventory-sheet/index', [
            'buildings' => Building::all(),
            'departments' => UnitOrDepartment::all(),
            'rooms' => BuildingRoom::all(),
            'subAreas' => SubArea::all(),
        ]);
    }

    public function generate(Request $request)
    {
        $buildingId = $request->building_id;
        $deptId     = $request->unit_or_department_id;
        $roomId     = $request->building_room_id;
        $subAreaId  = $request->sub_area_id;

        $assets = InventoryList::with(['assetModel', 'subArea'])
            ->when($buildingId, fn($q) => $q->where('building_id', $buildingId))
            ->when($deptId, fn($q) => $q->where('unit_or_department_id', $deptId))
            ->when($roomId, fn($q) => $q->where('building_room_id', $roomId))
            ->when($subAreaId, fn($q) => $q->where('sub_area_id', $subAreaId))
            ->get();

        // map asset statuses
        $assets = $assets->map(function ($asset) {
            // Default
            $quantity = $asset->quantity ?? 1;
            $remarks = 'Available';

            if ($asset->transfers()->exists()) {
                $latest = $asset->transfers()->latest()->first();
                $quantity = 0;
                $remarks = "Transferred to {$latest->receivingBuilding->name} on {$latest->created_at->format('M d, Y')}";
            }

            if ($asset->turnoverDisposalAssets()->exists()) {
                $latest = $asset->turnoverDisposalAssets()->latest()->first();
                $quantity = 0;
                $remarks = $latest->turnoverDisposal->status === 'disposed'
                    ? "Disposed on {$latest->turnoverDisposal->created_at->format('M d, Y')}"
                    : "Turned Over on {$latest->turnoverDisposal->created_at->format('M d, Y')}";
            }

            if ($asset->offCampusAssets()->exists()) {
                $latest = $asset->offCampusAssets()->latest()->first();
                $quantity = 0;
                $remarks = "Off-Campus – {$latest->location} on {$latest->created_at->format('M d, Y')}";
            }

            return [
                'id' => $asset->id,
                'asset_name' => $asset->asset_name,
                'asset_type' => $asset->asset_type,
                'sub_area'   => $asset->subArea?->name,
                'quantity'   => $quantity,
                'remarks'    => $remarks,
            ];
        });

        return response()->json($assets);
    }
}
