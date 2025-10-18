<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\PersonnelAssignmentsExport;
use App\Models\Personnel;
use App\Models\UnitOrDepartment;

class PersonnelAssignmentsReportController extends Controller
{
    public function index(Request $request)
    {
        $filters = array_filter(
            $request->only(['department_id', 'status']),
            fn($v) => !is_null($v) && $v !== ''
        );

        $perPage = (int) $request->get('per_page', 10);

        $paginator = Personnel::reportPaginated($filters, $perPage);
        $paginator->appends($filters);

        $chartData = Personnel::reportChartData($filters);

        return Inertia::render('reports/PersonnelAssignmentsReport', [
            'title' => 'Personnel Assignments Report',
            'records' => [
                'data' => $paginator->items(),
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
            'departments' => UnitOrDepartment::select('id', 'name')->get(),
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
