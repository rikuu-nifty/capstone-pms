<?php

namespace App\Http\Controllers;

use App\Models\OffCampus;
use App\Models\UnitOrDepartment;
use App\Exports\OffCampusReportExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class OffCampusReportController extends Controller
{
  public function index(Request $request)
{
    $from         = $request->input('from');
    $to           = $request->input('to');
    $status       = $request->input('status');
    $departmentId = $request->input('department_id');
    $requester    = $request->input('requester_name');

    // ✅ Base query with filters (for charts & records)
    $query = OffCampus::with(['assets', 'collegeOrUnit'])
        ->when($from, fn($q) => $q->whereDate('date_issued', '>=', $from))
        ->when($to, fn($q) => $q->whereDate('date_issued', '<=', $to))
        ->when($status, fn($q) => $q->where('status', $status))
        ->when($departmentId, fn($q) => $q->where('college_or_unit_id', $departmentId))
        ->when($requester, fn($q) => $q->where('requester_name', 'like', "%{$requester}%"));

    // ✅ Records (filtered)
    $records = $query->get()->map(function ($r) {
        return [
            'id'             => $r->id,
            'requester_name' => $r->requester_name,
            'department'     => $r->collegeOrUnit->name ?? '—',
            'purpose'        => $r->purpose,
            'date_issued'    => optional($r->date_issued)->toDateString(),
            'return_date'    => optional($r->return_date)?->toDateString(),
            'status'         => $r->status,
            'quantity'       => $r->quantity,
            'units'          => $r->units,
            'remarks'        => $r->remarks,
            'approved_by'    => $r->approved_by,
        ];
    });

    // ✅ KPI summary (NOT affected by filters)
    $allOffCampus = OffCampus::all();
    $summary = [
        'total'          => $allOffCampus->count(),
        'pending_review' => $allOffCampus->where('status', 'pending_review')->count(),
        'pending_return' => $allOffCampus->where('status', 'pending_return')->count(),
        'returned'       => $allOffCampus->where('status', 'returned')->count(),
        'overdue'        => $allOffCampus->where('status', 'overdue')->count(),
        'cancelled'      => $allOffCampus->where('status', 'cancelled')->count(),
    ];

    // ✅ Chart summaries (filtered)
    $statusSummary = $query->clone()
        ->selectRaw('status, COUNT(*) as total')
        ->groupBy('status')
        ->pluck('total', 'status');

    $purposeSummary = $query->clone()
        ->selectRaw('remarks, COUNT(*) as total')
        ->groupBy('remarks')
        ->pluck('total', 'remarks');

    return Inertia::render('reports/OffCampusReport', [
        'title'          => 'Off-Campus Report',
        'records'        => $records,
        'summary'        => $summary, // 👈 use this for KPI cards
        'statusSummary'  => $statusSummary, // 👈 filtered, for charts
        'purposeSummary' => $purposeSummary, // 👈 filtered, for charts
        'filters'        => $request->only(['from', 'to', 'status', 'department_id', 'requester_name']),
        'departments'    => UnitOrDepartment::select('id', 'name')->get(),
    ]);
}



    public function exportExcel(Request $request)
    {
        return Excel::download(new OffCampusReportExport($request->all()), 'OffCampusReport.xlsx');
    }

    public function exportPdf(Request $request)
    {
        // Reuse query with filters (same as index)
        $query = OffCampus::with(['assets', 'collegeOrUnit'])
            ->when($request->from, fn($q) => $q->whereDate('date_issued', '>=', $request->from))
            ->when($request->to, fn($q) => $q->whereDate('date_issued', '<=', $request->to))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->department_id, fn($q) => $q->where('college_or_unit_id', $request->department_id))
            ->when($request->requester_name, fn($q) => $q->where('requester_name', 'like', "%{$request->requester_name}%"));

        $records = $query->get();

        // 👇 Build filters array (friendly names like Property Transfer)
        $filters = [
            'from'          => $request->from,
            'to'            => $request->to,
            'status'        => $request->status,
            'department_id' => $request->department_id
                ? UnitOrDepartment::find($request->department_id)?->name
                : null,
            'requester_name' => $request->requester_name,
        ];

        $pdf = Pdf::loadView('reports.off_campus_report_pdf', [
            'records'     => $records,
            'filters'     => $filters,   // ✅ pass filters to view
            'generatedAt' => Carbon::now()->format('F d, Y h:i A'),
        ])->setPaper('A4', 'landscape');

        // return $pdf->stream('OffCampusReport.pdf');
        return $pdf->download('OffCampusReport.pdf');
    }

}
