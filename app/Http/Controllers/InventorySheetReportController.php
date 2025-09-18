<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\UnitOrDepartment;
use App\Models\BuildingRoom;
use App\Models\SubArea;
use App\Models\InventoryList;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\View;

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

        // Default per_page = 25, but allow override via query string
        $perPage = (int) $request->get('per_page', 25);

        // Force it to never exceed total count (important for frontend Pagination)
        if ($perPage <= 0) {
            $perPage = 10; // fallback
        }

        $paginator = $query->paginate($perPage)->withQueryString();

        // dd($paginator->toArray());

        // Transform each item in the paginator
        $assets = $paginator->getCollection()->map(function ($asset) {
            $quantity = 1;
            $status = 'Available';

            // --- Turnover/Disposal ---
            $td = $asset->turnoverDisposalAsset()->latest()->first();
            if ($td && $td->turnoverDisposal) {
                $quantity = 0;
                $type = $td->turnoverDisposal->type;
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
                    // --- Off-Campus ---
                    $oc = $asset->offCampusAssets()->latest()->first();
                    if ($oc && $oc->offCampus) {
                        $quantity = 0;
                        $date = optional($oc->offCampus->date_issued)->format('M d, Y');
                        $status = $oc->offCampus->remarks === 'repair'
                            ? "For Repair (Issued {$date})"
                            : "Off-Campus – {$oc->offCampus->purpose} ({$date})";
                    }
                }
            }

            $latestScheduling = $asset->schedulingAssets()->latest('created_at')->first();
            $inventoryStatus = $latestScheduling?->inventory_status ?? 'not_inventoried';

            $inventoriedAt   = $inventoryStatus === 'inventoried'
                ? $latestScheduling->inventoried_at
                : null;

            return [
                'id'               => $asset->id,
                'asset_name'       => $asset->asset_name,
                'asset_type'       => $asset->asset_type,
                'sub_area'         => optional($asset->subArea)->name,
                'quantity'         => $quantity,
                'status'           => $status,
                'inventory_status' => $inventoryStatus,
                'memorandum_no'    => $asset->memorandum_no,
                'supplier'         => $asset->supplier,
                'date_purchased'   => $asset->date_purchased,
                'unit_cost'        => $asset->unit_cost,
                'inventoried_at'   => $inventoriedAt,
                'serial_no'        => $asset->serial_no,
            ];
        });

        $paginator->setCollection($assets);

        $chartQuery = InventoryList::with(['schedulingAssets'])
            ->when($buildingId, fn($q) => $q->where('building_id', $buildingId))
            ->when($deptId, fn($q) => $q->where('unit_or_department_id', $deptId))
            ->when($roomId, fn($q) => $q->where('building_room_id', $roomId))
            ->when($subAreaId, fn($q) => $q->where('sub_area_id', $subAreaId));

        $allInventoryStatuses = $chartQuery->get()->map(function ($asset) {
            $latestScheduling = $asset->schedulingAssets()->latest('created_at')->first();
            return $latestScheduling?->inventory_status ?? 'not_inventoried';
        });

        $labels = [
            'not_inventoried' => 'Not Inventoried',
            'scheduled'       => 'Scheduled',
            'inventoried'     => 'Inventoried',
        ];

        $chartData = collect($allInventoryStatuses)
            ->countBy()
            ->map(function ($count, $status) use ($labels) {
                return [
                    'label' => $labels[$status] ?? ucfirst(str_replace('_', ' ', $status)),
                    'value' => $count,
                ];
            })
            ->values()
            ->toArray();

        return Inertia::render('reports/InventorySheetReport', [
            'buildings'   => Building::select('id', 'name')->get(),
            'departments' => UnitOrDepartment::select('id', 'name')->get(),
            'rooms'       => BuildingRoom::select('id', 'room', 'building_id')->get(),
            'subAreas'    => SubArea::select('id', 'name', 'building_room_id')->get(),
            // 'assets'      => $paginator,
            'assets' => [
                'data'  => $paginator->items(),
                'meta'  => [
                    'current_page' => $paginator->currentPage(),
                    'from'         => $paginator->firstItem(),
                    'last_page'    => $paginator->lastPage(),
                    'path'         => $paginator->path(),
                    'per_page'     => $paginator->perPage(),
                    'to'           => $paginator->lastItem(),
                    'total'        => $paginator->total(),
                ],
                'links' => $paginator->linkCollection(),
            ],
            'chartData'   => $chartData,
        ]);
    }

    public function exportPdf(Request $request)
    {
        $filters = $request->all();

        // same logic as index(), but group by sub_area
        $assets = $this->getAssetsForExport($filters);

        $pdf = Pdf::loadView('reports.inventory_sheet_pdf', [
            'assets'  => $assets,
            'filters' => $filters,
        ])->setPaper('A4', 'landscape');

        return $pdf->download('inventory_sheet_report.pdf');
    }

    public function exportExcel(Request $request)
    {
        $filters = $request->all();
        $assets  = $this->getAssetsForExport($filters);

        return Excel::download(new class($assets, $filters) implements \Maatwebsite\Excel\Concerns\FromView {
            protected $assets;
            protected $filters;

            public function __construct($assets, $filters)
            {
                $this->assets  = $assets;
                $this->filters = $filters;
            }

            public function view(): \Illuminate\Contracts\View\View
            {
                return View::make('reports.inventory_sheet_excel', [
                    'assets'  => $this->assets,
                    'filters' => $this->filters,
                ]);
            }
        }, 'inventory_sheet_report.xlsx');
    }

    private function getAssetsForExport($filters)
    {
        $buildingId = $filters['building_id'] ?? null;
        $deptId     = $filters['department_id'] ?? null;
        $roomId     = $filters['room_id'] ?? null;
        $subAreaId  = $filters['sub_area_id'] ?? null;

        $query = InventoryList::with(['subArea', 'buildingRoom', 'unitOrDepartment'])
            ->when($buildingId, fn($q) => $q->where('building_id', $buildingId))
            ->when($deptId, fn($q) => $q->where('unit_or_department_id', $deptId))
            ->when($roomId, fn($q) => $q->where('building_room_id', $roomId))
            ->when($subAreaId, fn($q) => $q->where('sub_area_id', $subAreaId));

        $assets = $query->get()->map(function ($asset) {
            return [
                'id'               => $asset->id,
                'memorandum_no'    => $asset->memorandum_no,
                'asset_name'       => $asset->asset_name,
                'asset_type'       => $asset->asset_type,
                'serial_no'        => $asset->serial_no,
                'unit_cost'        => $asset->unit_cost,
                'supplier'         => $asset->supplier,
                'date_purchased'   => $asset->date_purchased,
                'quantity'         => 1,
                'status'           => 'Available', // reuse your index logic if needed
                'inventory_status' => 'not_inventoried',
                'inventoried_at'   => null,
                'sub_area'         => optional($asset->subArea)->name,
            ];
        });

        // ✅ Group by sub-area
        return $assets->groupBy('sub_area');
    }
}
