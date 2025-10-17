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
                'type',
                'building_id',
                'room_id',
                'issuing_office_id',
                'receiving_office_id',
                'category_id',
                'turnover_category',
                'is_donation',
            ]),
            fn($value) => !is_null($value) && $value !== ''
        );

        $perPage = (int) $request->get('per_page', 10);

        $paginator = TurnoverDisposal::filterAndPaginateAssets($filters, $perPage);
        $paginator->appends($filters);

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
        $records = TurnoverDisposal::filterAndPaginateAssets($filters, 2000);

        $timestamp = now()->format('Y-m-d');
        $filename  = "Turnover_Disposal_Report-{$timestamp}.xlsx";

        return Excel::download(
            new TurnoverDisposalReportExport($records->items(), $filters),
            $filename
        );
    }

    public function exportPdf(Request $request)
    {
        $filters = $request->all();
        $records = TurnoverDisposal::filterAndPaginateAssets($filters, 2000);

        $pdf = Pdf::loadView('reports.turnover_disposal_pdf', [
            'records' => $records->items(),
            'filters' => $filters,
        ])->setPaper('A4', 'landscape')
        ->setOption('isPhpEnabled', true);

        // return $pdf->download('Turnover_Disposal_Report-' . now()->format('Y-m-d') . '.pdf');
        return $pdf->stream('Turnover_Disposal_Report');
    }
}
