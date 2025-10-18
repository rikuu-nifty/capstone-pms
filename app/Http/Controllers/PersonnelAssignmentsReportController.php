<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Personnel;
use App\Models\UnitOrDepartment;
use App\Models\Category;

use App\Exports\PersonnelAssignmentsExport;

class PersonnelAssignmentsReportController extends Controller
{
    public function index(Request $request)
    {
        $filters = array_filter(
            $request->only([
                'department_id',
                'status',
                'personnel_id',
                'category_id',
                'from',
                'to',
            ]),
            fn($v) => !is_null($v) && $v !== ''
        );

        $perPage = (int) $request->get('per_page', 10);

        $paginator = Personnel::reportPaginated($filters, $perPage);
        $paginator->appends($filters);

        $assetPaginator = Personnel::reportAssetRowsPaginated($filters, $perPage);
        $assetPaginator->appends($filters);

        $records = $paginator->getCollection()->map(function ($personnel) {
            return [
                'id' => $personnel->id,
                'full_name' => $personnel->full_name,
                'department' => $personnel->unitOrDepartment?->name ?? '—',
                'status' => $personnel->status,
                'current_assets_count' => (int) $personnel->current_assets_count,
                'past_assets_count' => (int) $personnel->past_assets_count,
            ];
        });

        $assetRecords = collect($assetPaginator->items())->map(fn($r) => [
            'assignment_item_id' => $r->assignment_item_id,
            'asset_name' => $r->asset_name,
            'category' => $r->category,
            'equipment_code' => $r->equipment_code,
            'serial_no' => $r->serial_no,
            'asset_unit_or_department' => $r->asset_unit_or_department,
            'personnel_name' => $r->personnel_name,
            'previous_personnel_name' => $r->previous_personnel_name,
            'date_assigned' => $r->date_assigned,
            
            'current_transfer_status' => $r->current_transfer_status,
            'current_turnover_disposal_status' => $r->current_turnover_disposal_status,
            'current_off_campus_status' => $r->current_off_campus_status,
            'current_inventory_status'  => $r->current_inventory_status,
        ]);

        $chartData = Personnel::reportChartData($filters);

        return Inertia::render('reports/PersonnelAssignmentsReport', [
            'title' => 'Personnel Assignments Report',
            'records' => [
                'data' => $records,
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'from' => $paginator->firstItem(),
                    'last_page' => $paginator->lastPage(),
                    'path' => $paginator->path(),
                    'per_page' => $paginator->perPage(),
                    'to' => $paginator->lastItem(),
                    'total' => $paginator->total(),
                ],
                'links' => $paginator->linkCollection(),
            ],
            'assetRecords' => [
                'data' => $assetRecords,
                'meta' => [
                    'current_page' => $assetPaginator->currentPage(),
                    'from' => $assetPaginator->firstItem(),
                    'last_page' => $assetPaginator->lastPage(),
                    'path' => $assetPaginator->path(),
                    'per_page' => $assetPaginator->perPage(),
                    'to' => $assetPaginator->lastItem(),
                    'total' => $assetPaginator->total(),
                ],
                'links' => $assetPaginator->linkCollection(),
            ],
            'departments' => UnitOrDepartment::select('id', 'name')->get(),
            'personnels' => Personnel::whereNull('deleted_at')
                ->orderBy('last_name')
                ->get(['id', 'first_name', 'middle_name', 'last_name']),
            'categories' => Category::select('id', 'name')->orderBy('name')->get(),
            'filters' => $filters,
            'chartData' => $chartData,
        ]);
    }

    public function exportExcel(Request $request)
    {
        $filters = $request->all();
        $data = Personnel::reportExportData($filters);

        $timestamp = now()->format('Y-m-d');
        $filename = "Personnel_Assignments_Report_{$timestamp}.xlsx";

        return Excel::download(new PersonnelAssignmentsExport($data, $filters), $filename);
    }
}
