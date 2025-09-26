<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;

use App\Models\TurnoverDisposal;
use App\Models\Building;
use App\Models\BuildingRoom;
use App\Models\UnitOrDepartment;
use App\Models\Category;
use App\Exports\TurnoverDisposalReportExport;

use Carbon\CarbonPeriod;

class TurnoverDisposalReportController extends Controller
{
    public function index(Request $request)
    {
        $filters = array_filter(
            $request->only([
                'from',
                'to',
                'status',
                'building_id',
                'room_id',
                'issuing_office_id',
                'receiving_office_id',
                'category_id',
            ]),
            fn($value) => !is_null($value) && $value !== ''
        );

        $perPage = (int) $request->get('per_page', 10);

        $paginator = TurnoverDisposal::filterAndPaginate($filters, $perPage);

        $paginator->appends($filters);

        $rows = $paginator->getCollection()->flatMap(function ($td) {
            return $td->turnoverDisposalAssets->map(function ($assetLine) use ($td) {
                $asset = $assetLine->assets; // InventoryList
                $model = $asset?->assetModel;
                $category = $model?->category;

                return [
                    'id'                => $td->id,
                    'type'              => ucfirst($td->type),
                    'issuing_office'    => $td->issuingOffice->name ?? '—',
                    'receiving_office'  => $td->receivingOffice->name ?? '—',
                    'asset_id'          => $asset->id ?? null,
                    'serial_no'         => $asset->serial_no ?? '—',
                    'asset_name'        => $asset->asset_name ?? '—',
                    'category'          => $asset->assetModel?->category?->name ?? '—',
                    'brand'             => $model?->brand ?? '—',
                    'model'             => $model?->model ?? '—',
                    'building'          => $asset->building->name ?? '—',
                    'room'              => $asset->buildingRoom->room ?? '—',
                    'status'            => $td->status,
                    'asset_status'      => $assetLine->asset_status,
                    'document_date'     => optional($td->document_date)->format('Y-m-d'),
                    'remarks'           => $assetLine->remarks ?? $td->remarks,
                ];
            });
        });

        $paginator->setCollection($rows);

        $rawData = TurnoverDisposal::monthlyCompletedTrendData();

        // Generate Jan–Dec for current year
        $year = now()->year;
        $months = CarbonPeriod::create("{$year}-01-01", '1 month', "{$year}-12-01");

        $chartData = collect($months)->map(function ($date) use ($rawData) {
            $ym = $date->format('Y-m');
            return [
                'month'    => $date->format('F'), // January, February...
                'turnover' => (int) ($rawData[$ym]->turnover ?? 0),
                'disposal' => (int) ($rawData[$ym]->disposal ?? 0),
            ];
        });

        return Inertia::render('reports/TurnoverDisposalReport', [
            'title'         => 'Turnover/Disposal Report',
            'summary'       => TurnoverDisposal::summaryCounts(),
            'monthlyTrends' => TurnoverDisposal::monthlyTrendData(),
            'records'       => [
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
            'buildings'     => Building::select('id', 'name')->get(),
            'departments'   => UnitOrDepartment::select('id', 'name')->get(),
            'categories'    => Category::select('id', 'name')->get(),
            'rooms'         => BuildingRoom::select('id', 'room as name', 'building_id')->get(),
            'filters'       => $filters,
            'chartData'     => $chartData,
        ]);
    }

    public function exportExcel(Request $request)
    {
        $filters = $request->all();
        $records = TurnoverDisposal::filterAndPaginate($filters, 1000); // big page size

        $exportData = [
            'records' => $records->items(),
            'filters' => $filters,
        ];

        return Excel::download(new TurnoverDisposalReportExport($exportData), 'TurnoverDisposalReport.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $filters = $request->all();

        // fetch with large page size (no pagination limit for export)
        $records = TurnoverDisposal::filterAndPaginate($filters, 2000);

        $pdf = Pdf::loadView('reports.turnover_disposal_pdf', [
            'records' => $records->items(),
            'filters' => $filters,
        ])
            ->setPaper('a4', 'landscape');

        $timestamp = now()->format('Y-m-d');
        return $pdf->download("TurnoverDisposalReport-{$timestamp}.pdf");
    }
}
