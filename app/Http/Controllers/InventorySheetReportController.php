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
use Illuminate\Support\Collection;
use Carbon\Carbon;

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

        $from = $request->input('from');
        $to   = $request->input('to');

        if ($from || $to) {
            $query->where(function ($outer) use ($from, $to) {
                if ($from) {
                    $outer->whereDate('date_purchased', '>=', $from)
                        ->orWhereHas('schedulingAssets', function ($s) use ($from) {
                            $s->whereDate('inventoried_at', '>=', $from);
                        });
                }
                if ($to) {
                    $outer->whereDate('date_purchased', '<=', $to)
                        ->orWhereHas('schedulingAssets', function ($s) use ($to) {
                            $s->whereDate('inventoried_at', '<=', $to);
                        });
                }
            });
        }

        if ($request->filled('inventory_status')) {
            $query->whereHas('schedulingAssets', function ($q) use ($request) {
                $q->latest('created_at') // ensure we look at latest scheduling
                    ->where('inventory_status', $request->inventory_status);
            });
        }

        // Default per_page = 25, but allow override via query string
        $perPage = (int) $request->get('per_page', 10);

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

        // $allInventoryStatuses = $chartQuery->get()->map(function ($asset) {
        //     $latestScheduling = $asset->schedulingAssets()->latest('created_at')->first();
        //     return $latestScheduling?->inventory_status ?? 'not_inventoried';
        // });

        // $labels = [
        //     'not_inventoried' => 'Not Inventoried',
        //     'scheduled'       => 'Scheduled',
        //     'inventoried'     => 'Inventoried',
        // ];

        // $chartData = collect($allInventoryStatuses)
        //     ->countBy()
        //     ->map(function ($count, $status) use ($labels) {
        //         return [
        //             'label' => $labels[$status] ?? ucfirst(str_replace('_', ' ', $status)),
        //             'value' => $count,
        //         ];
        //     })
        //     ->values()
        //     ->toArray();

        $chartData = $chartQuery->get()->flatMap(function ($asset) {
            return $asset->schedulingAssets->map(function ($s) {
                // prefer inventoried_at if present, else created_at
                if ($s->inventory_status === 'inventoried' && $s->inventoried_at) {
                    $date = Carbon::parse($s->inventoried_at)->toDateString();
                } else {
                    $date = Carbon::parse($s->created_at)->toDateString();
                }

                return [
                    'date'             => $date,
                    'inventory_status' => $s->inventory_status ?? 'not_inventoried',
                ];
            });
        });

        $chartData = $chartData
            ->groupBy('date')
            ->map(function (Collection $items, $date) {
                return [
                    'date'            => $date,
                    'inventoried'     => $items->where('inventory_status', 'inventoried')->count(),
                    'scheduled'       => $items->where('inventory_status', 'scheduled')->count(),
                    'not_inventoried' => $items->where('inventory_status', 'not_inventoried')->count(),
                ];
            })
            ->sortKeys()
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
        ])
        ->setPaper('A4', 'landscape')
        ->setOption('isPhpEnabled', true);

        $timestamp = now()->format('Y-m-d');

        return $pdf->download("Inventory-Sheet-Report-{$timestamp}.pdf");
        // return $pdf->stream('inventory_sheet_report.pdf');
    }

    public function exportExcel(Request $request)
    {
        $filters = $request->all();
        $assets  = $this->getAssetsForExport($filters);

        $timestamp = now()->format('Y-m-d');
        $filename = "Inventory-Sheet-Report-{$timestamp}.xlsx";

        return Excel::download(new class($assets, $filters) implements
            \Maatwebsite\Excel\Concerns\FromView,
            \Maatwebsite\Excel\Concerns\WithColumnWidths,
            \Maatwebsite\Excel\Concerns\WithStyles
        {
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

            public function columnWidths(): array
            {
                return [
                    'A' => 12,  // MR No.
                    'B' => 30,  // Asset Name (Type)
                    'C' => 20,  // Serial No.
                    'D' => 12,  // Price
                    'E' => 25,  // Supplier
                    'F' => 18,  // Date Purchased
                    'G' => 10,  // Per Record
                    'H' => 10,  // Actual
                    'I' => 20,  // Inventory Status
                    'J' => 18,  // Date of Count
                    'K' => 40,  // Remarks
                ];
            }

            public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet)
            {
                $highestRow = $sheet->getHighestRow();

                // Header row center + bold
                $sheet->getStyle('A1:K1')->getAlignment()->setHorizontal('center');
                $sheet->getStyle('A1:K1')->getFont()->setBold(true);

                // Loop through rows and apply style
                for ($row = 2; $row <= $highestRow; $row++) {
                    $value = trim((string) $sheet->getCell("A{$row}")->getValue());

                    // normalize hyphen types
                    $normalized = str_replace(['–', '—'], '-', $value);

                    if ($normalized && preg_match('/^(Sub-?Area|Room|Memo)/i', $normalized)) {
                        // Group label row → left aligned + bold
                        $sheet->getStyle("A{$row}:K{$row}")
                            ->getAlignment()->setHorizontal('left');
                        $sheet->getStyle("A{$row}:K{$row}")
                            ->getFont()->setBold(true);
                    } else {
                        // Normal data row → center align
                        $sheet->getStyle("A{$row}:K{$row}")
                            ->getAlignment()->setHorizontal('center');
                    }
                }

                return [];
            }
        }, $filename);
    }

    private function getAssetsForExport($filters)
    {
        $buildingId = $filters['building_id'] ?? null;
        $deptId     = $filters['department_id'] ?? null;
        $roomId     = $filters['room_id'] ?? null;
        $subAreaId  = $filters['sub_area_id'] ?? null;

        $query = InventoryList::with([
            'subArea',
            'buildingRoom',
            'unitOrDepartment',
            'turnoverDisposalAsset.turnoverDisposal',
            'transferAssets.transfer.receivingBuildingRoom.building',
            'offCampusAssets.offCampus',
            'schedulingAssets',
        ])
            ->when($buildingId, fn($q) => $q->where('building_id', $buildingId))
            ->when($deptId, fn($q) => $q->where('unit_or_department_id', $deptId))
            ->when($roomId, fn($q) => $q->where('building_room_id', $roomId))
            ->when($subAreaId, fn($q) => $q->where('sub_area_id', $subAreaId))
            ->when(!empty($filters['from']), function ($q) use ($filters) {
                $from = $filters['from'];
                $q->where(function ($query) use ($from) {
                    $query->whereDate('date_purchased', '>=', $from)
                        ->orWhereHas('schedulingAssets', function ($sub) use ($from) {
                            $sub->whereDate('inventoried_at', '>=', $from);
                        });
                });
            })
            ->when(!empty($filters['to']), function ($q) use ($filters) {
                $to = $filters['to'];
                $q->where(function ($query) use ($to) {
                    $query->whereDate('date_purchased', '<=', $to)
                        ->orWhereHas('schedulingAssets', function ($sub) use ($to) {
                            $sub->whereDate('inventoried_at', '<=', $to);
                        });
                });
            });

        $assets = $query->get()->map(function ($asset) {
            $quantity = 1;
            $status = 'Available';

            // … your disposal/transfer/off-campus logic …

            $latestScheduling = $asset->schedulingAssets()->latest('created_at')->first();
            $inventoryStatus = $latestScheduling?->inventory_status ?? 'not_inventoried';

            $inventoriedAt   = $inventoryStatus === 'inventoried'
                ? $latestScheduling->inventoried_at
                : null;

            return [
                'id'               => $asset->id,
                'memorandum_no'    => $asset->memorandum_no,
                'asset_name'       => $asset->asset_name,
                'asset_type'       => $asset->asset_type,
                'serial_no'        => $asset->serial_no,
                'unit_cost'        => $asset->unit_cost,
                'supplier'         => $asset->supplier,
                'date_purchased'   => $asset->date_purchased,
                'quantity'         => $quantity,
                'status'           => $status,
                'inventory_status' => $inventoryStatus,
                'inventoried_at'   => $inventoriedAt,
                'sub_area'         => optional($asset->subArea)->name,
                'room'             => optional($asset->buildingRoom)->room,
            ];
        });

        return $assets->groupBy(function ($a) {
            return $a['sub_area'] ? 'sub_area:' . $a['sub_area']
                : ($a['room'] ? 'room:' . $a['room']
                    : ($a['memorandum_no'] ? 'memo:' . $a['memorandum_no'] : 'ungrouped'));
        });
    }
}
