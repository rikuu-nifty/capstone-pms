<?php

namespace App\Http\Controllers;

use App\Models\InventoryScheduling;
use App\Models\Building;
use App\Models\BuildingRoom;
use App\Models\UnitOrDepartment;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Exports\InventorySchedulingReportExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class InventorySchedulingReportController extends Controller
{
    /**
     * Display the Inventory Scheduling Report page.
     */
    

    public function exportExcel(Request $request)
{
    $query = InventoryScheduling::with([
        'unitOrDepartment',
        'building',
        'buildingRoom',
        'subAreas',
        'preparedBy',
        'designatedEmployee',
        'assignedBy',
    ]);

    if ($request->filled('scheduling_status')) {
        $query->where('scheduling_status', $request->scheduling_status);
    }
    if ($request->filled('building_id')) {
        $query->where('building_id', $request->building_id);
    }
    if ($request->filled('department_id')) {
        $query->where('unit_or_department_id', $request->department_id);
    }
    if ($request->filled('from')) {
        $query->whereDate('actual_date_of_inventory', '>=', $request->from);
    }
    if ($request->filled('to')) {
        $query->whereDate('actual_date_of_inventory', '<=', $request->to);
    }
    if ($request->filled('room_id')) {
        $query->where('building_room_id', $request->room_id);
    }

    $schedules = $query->get();

    $filters = [
        'from'              => $request->from,
        'to'                => $request->to,
        'scheduling_status' => $request->scheduling_status,
        'building_id'       => $request->building_id ? Building::find($request->building_id)?->name : null,
        'department_id'     => $request->department_id ? UnitOrDepartment::find($request->department_id)?->name : null,
        'room_id'           => $request->room_id ? BuildingRoom::find($request->room_id)?->room : null,
    ];

    return Excel::download(
    new InventorySchedulingReportExport($filters, $schedules), 
    'InventorySchedulingReport.xlsx'
);
}
public function exportPdf(Request $request)
{
    // reuse same query/filters as index
    $query = InventoryScheduling::with([
        'unitOrDepartment:id,name',
        'building:id,name',
        'buildingRoom:id,room,building_id',
        'subAreas:id,name,building_room_id',
        'preparedBy:id,name',
        'designatedEmployee:id,name',
        'assignedBy:id,name',
    ]);

    if ($request->filled('scheduling_status')) {
        $query->where('scheduling_status', $request->scheduling_status);
    }
    if ($request->filled('building_id')) {
        $query->where('building_id', $request->building_id);
    }
    if ($request->filled('department_id')) {
        $query->where('unit_or_department_id', $request->department_id);
    }
    if ($request->filled('from')) {
        $query->whereDate('actual_date_of_inventory', '>=', $request->from);
    }
    if ($request->filled('to')) {
        $query->whereDate('actual_date_of_inventory', '<=', $request->to);
    }
    if ($request->filled('room_id')) {
        $query->where('building_room_id', $request->room_id);
    }

    $schedules = $query->get();

    // 👇 Build filters array (same style as index)
   $filters = [
    'from'              => $request->from,
    'to'                => $request->to,
    'scheduling_status' => $request->scheduling_status,
    'building_id'       => $request->building_id
        ? Building::find($request->building_id)?->name
        : null,
    'department_id'     => $request->department_id
        ? UnitOrDepartment::find($request->department_id)?->name
        : null,
    'room_id'           => $request->room_id
        ? BuildingRoom::find($request->room_id)?->room
        : null,
   ];

    $pdf = Pdf::loadView('reports.inventory_scheduling_pdf', [
        'schedules' => $schedules,
        'filters'   => $filters, // ✅ now defined
    ])->setPaper('a4', 'landscape');

    return $pdf->download('InventorySchedulingReport.pdf');
}


 public function summaryForDashboard()
    {
        return InventoryScheduling::selectRaw("
            CASE 
                WHEN scheduling_status = 'Pending_Review' THEN 'Pending Review'
                ELSE scheduling_status
            END as label,
            COUNT(*) as value
        ")
        ->groupBy('label')
        ->get();
    }



public function index(Request $request)
{
    // -----------------------------
    // 1. Global Summary (no filters)
    // -----------------------------
    $globalTotal     = InventoryScheduling::count();
    $globalCompleted = InventoryScheduling::where('scheduling_status', 'Completed')->count();
    $globalPending   = InventoryScheduling::where('scheduling_status', 'Pending')->count();
    $globalReview    = InventoryScheduling::where('scheduling_status', 'Pending_Review')->count();
    $globalOverdue   = InventoryScheduling::where('scheduling_status', 'Overdue')->count();
    $globalCancelled = InventoryScheduling::where('scheduling_status', 'Cancelled')->count();

    // -----------------------------
    // 2. Filtered Query (for charts + table)
    // -----------------------------
    $query = InventoryScheduling::with([
        'unitOrDepartment:id,name',
        'building:id,name',
        'buildingRoom:id,room,building_id',
         'subAreas:id,name,building_room_id', // 👈 include building_room_id
    ]);

    if ($request->filled('scheduling_status')) {
        $query->where('scheduling_status', $request->scheduling_status);
    }
    if ($request->filled('building_id')) {
        $query->where('building_id', $request->building_id);
    }
    if ($request->filled('department_id')) {
        $query->where('unit_or_department_id', $request->department_id);
    }
    if ($request->filled('from')) {
        $query->whereDate('actual_date_of_inventory', '>=', $request->from);
    }
    if ($request->filled('to')) {
        $query->whereDate('actual_date_of_inventory', '<=', $request->to);
    }
    if ($request->filled('room_id')) {
        $query->where('building_room_id', $request->room_id); // 👈 correct column
    }

    // ✅ Filtered summary for chart
    $filteredCompleted = (clone $query)->where('scheduling_status', 'Completed')->count();
    $filteredPending   = (clone $query)->where('scheduling_status', 'Pending')->count();
    $filteredReview    = (clone $query)->where('scheduling_status', 'Pending_Review')->count();
    $filteredOverdue   = (clone $query)->where('scheduling_status', 'Overdue')->count();
    $filteredCancelled = (clone $query)->where('scheduling_status', 'Cancelled')->count();
    $filteredTotal     = $filteredCompleted + $filteredPending + $filteredReview + $filteredOverdue + $filteredCancelled;

    // ✅ Monthly trends also filtered
    $monthlyTrends = (clone $query)
        ->selectRaw("DATE_FORMAT(actual_date_of_inventory, '%Y-%m') as ym, COUNT(*) as total")
        ->groupBy('ym')
        ->orderBy('ym')
        ->get();

    // -----------------------------
    // 3. Paginated detailed schedules (for table)
    // -----------------------------
  $schedules = $query
    ->select(
        'id',
        'unit_or_department_id',
        'building_id',
        'building_room_id',
        'inventory_schedule', // ✅ correct column
        'actual_date_of_inventory',
        'scheduling_status'
    )
    ->get()
    ->map(function ($sched) {
        return [
            'id' => $sched->id,

            // ✅ Departments: pivot or FK
            'department' => $sched->unitOrDepartment->name
                ?? $sched->units->pluck('name')->implode(', ')
                ?? '—',
                

            // ✅ Buildings: pivot or FK
            'building' => $sched->building->name
                ?? $sched->buildings->pluck('name')->implode(', ')
                ?? '—',

            'room' => $sched->rooms->pluck('room')->implode(', ')
                ?: ($sched->buildingRoom->room ?? '—'),

            'sub_area' => $sched->rooms
            ->flatMap(function ($room) use ($sched) {
                return $sched->subAreas
                    ->where('building_room_id', $room->id)
                    ->pluck('name')
                    ->values(); // keep order
            })
            ->implode(', ')
            ?: '—',


            // ✅ Use `inventory_schedule` but expose as inventory_month for frontend
            'inventory_month' => $sched->inventory_schedule ?? '—',

            'actual_date' => $sched->actual_date_of_inventory,

            // ✅ Count assets via relation
            'assets' => $sched->assets()->count() ?? 0,

            'status' => $sched->scheduling_status,
        ];
    })
    ->values(); // 👈 ensures a clean indexed array for React



    // -----------------------------
    // 4. Return to Inertia
    // -----------------------------
    return Inertia::render('reports/InventorySchedulingReport', [
    'title' => 'Inventory Scheduling Report',

    // KPI Cards → Global
    'summary' => [
        'total'          => $globalTotal,
        'completed'      => $globalCompleted,
        'pending'        => $globalPending,
        'pending_review' => $globalReview,
        'overdue'        => $globalOverdue,
        'cancelled'      => $globalCancelled,
    ],

    // Chart → Filtered
    'chartSummary' => [
        'total'          => $filteredTotal,
        'completed'      => $filteredCompleted,
        'pending'        => $filteredPending,
        'pending_review' => $filteredReview,
        'overdue'        => $filteredOverdue,
        'cancelled'      => $filteredCancelled,
    ],

    'monthlyTrends' => $monthlyTrends,

    // ✅ schedules is now a plain array (mapped collection), same as assets in InventoryListReport
    'schedules' => $schedules->values(), 

    'buildings'   => Building::select('id', 'name')->get(),
    'departments' => UnitOrDepartment::select('id', 'name')->get(),
    'rooms'       => BuildingRoom::select('id', 'room as name', 'building_id')->get(),

    // 👇 send filters back so frontend stays in sync
    'filters' => [
        'from'              => $request->from,
        'to'                => $request->to,
        'scheduling_status' => $request->scheduling_status,
        'building_id'       => $request->building_id,
        'department_id'     => $request->department_id,
        'room_id'           => $request->room_id,
    ],
]);

}





}
