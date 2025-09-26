<?php

namespace App\Http\Controllers;

use App\Models\Transfer;
use App\Models\Building;
use App\Models\BuildingRoom;
use App\Models\UnitOrDepartment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\PropertyTransferReportExport;

class PropertyTransferReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function exportExcel(Request $request)
    {
        $filters = $request->only(['from','to','status','department_id','building_id','room_id']);
        return Excel::download(new PropertyTransferReportExport($filters), 'PropertyTransferReport.xlsx');
    }
    

public function exportPdf(Request $request)
{
    // Reuse query with filters (same as index)
    $query = Transfer::with([
        'currentBuildingRoom.building',
        'receivingBuildingRoom.building',
        'currentOrganization',
        'receivingOrganization',
        'assignedBy',
        'transferAssets',
    ]);

    if ($request->filled('from')) {
        $query->whereDate('scheduled_date', '>=', $request->from);
    }
    if ($request->filled('to')) {
        $query->whereDate('scheduled_date', '<=', $request->to);
    }
    if ($request->filled('status')) {
        $query->where('status', $request->status);
    }
    if ($request->filled('department_id')) {
        $query->where(function ($q) use ($request) {
            $q->where('current_organization', $request->department_id)
              ->orWhere('receiving_organization', $request->department_id);
        });
    }
    if ($request->filled('building_id')) {
        $query->where(function ($q) use ($request) {
            $q->whereHas('currentBuildingRoom', fn($q2) => $q2->where('building_id', $request->building_id))
              ->orWhereHas('receivingBuildingRoom', fn($q2) => $q2->where('building_id', $request->building_id));
        });
    }
    if ($request->filled('room_id')) {
        $query->where(function ($q) use ($request) {
            $q->where('current_building_room', $request->room_id)
              ->orWhere('receiving_building_room', $request->room_id);
        });
    }

    $transfers = $query->get();

    // 👇 Build filters array (same style as inventory scheduling)
    $filters = [
        'from'          => $request->from,
        'to'            => $request->to,
        'status'        => $request->status,
        'building_id'   => $request->building_id
            ? Building::find($request->building_id)?->name
            : null,
        'department_id' => $request->department_id
            ? UnitOrDepartment::find($request->department_id)?->name
            : null,
        'room_id'       => $request->room_id
            ? BuildingRoom::find($request->room_id)?->room
            : null,
    ];

    $pdf = Pdf::loadView('reports.property_transfer_report_pdf', [
        'transfers' => $transfers,
        'filters'   => $filters,
    ])->setPaper('A4', 'landscape');

    return $pdf->download('PropertyTransferReport.pdf');
//     return $pdf->stream('PropertyTransferReport.pdf');
}




public function index(Request $request)
{
    $from       = $request->input('from');
    $to         = $request->input('to');
    $status     = $request->input('status');
    $building   = $request->input('building_id');
    $department = $request->input('department_id');
    $room       = $request->input('room_id');

    $dateField = 'scheduled_date';

    $query = Transfer::with([
        'currentBuildingRoom.building',
        'receivingBuildingRoom.building',
        'currentOrganization',
        'receivingOrganization',
        'assignedBy',
        'transferAssets',
    ])
        ->when($from, fn($q) => $q->whereDate($dateField, '>=', Carbon::parse($from)))
        ->when($to, fn($q) => $q->whereDate($dateField, '<=', Carbon::parse($to)))
        ->when($status, fn($q) => $q->where('status', $status))

        // ✅ Department filter
        ->when($department, function ($q) use ($department) {
            $q->where(function ($sub) use ($department) {
                $sub->where('current_organization', $department)
                    ->orWhere('receiving_organization', $department);
            });
    })

        // ✅ Building filter, respecting department if set
        ->when($building, function ($q) use ($building, $department) {
            $q->where(function ($sub) use ($building) {
                $sub->whereHas('currentBuildingRoom', function ($q2) use ($building) {
                        $q2->where('building_id', $building);
                    })
                    ->orWhereHas('receivingBuildingRoom', function ($q2) use ($building) {
                        $q2->where('building_id', $building);
                    });
            });

    // If department is set, enforce it alongside building
    if ($department) {
        $q->where(function ($sub) use ($department) {
            $sub->where('current_organization', $department)
                ->orWhere('receiving_organization', $department);
        });
    }
})

// ✅ Room filter (applies alongside building/department if provided)
->when($room, function ($q) use ($room, $department, $building) {
    $q->where(function ($sub) use ($room) {
        $sub->where('current_building_room', $room)  // ✅ FIX: correct column
            ->orWhere('receiving_building_room', $room); // ✅ FIX: correct column
    });

    if ($department) {
        $q->where(function ($sub) use ($department) {
            $sub->where('current_organization', $department)
                ->orWhere('receiving_organization', $department);
        });
    }

    if ($building) {
        $q->where(function ($sub) use ($building) {
            $sub->whereHas('currentBuildingRoom', fn($q2) => $q2->where('building_id', $building))
                ->orWhereHas('receivingBuildingRoom', fn($q2) => $q2->where('building_id', $building));
        });
    }
        });

    $transfers = $query->get();

    // KPI summary (unfiltered)
    $allTransfers = Transfer::all();
    $summary = [
        'total'          => $allTransfers->count(),
        'completed'      => $allTransfers->where('status', 'completed')->count(),
        'pending_review' => $allTransfers->where('status', 'pending_review')->count(),
        'upcoming'       => $allTransfers->where('status', 'upcoming')->count(),
        'in_progress'    => $allTransfers->where('status', 'in_progress')->count(),
        'overdue'        => $allTransfers->where('status', 'overdue')->count(),
        'cancelled'      => $allTransfers->where('status', 'cancelled')->count(),
    ];

    // Chart summary (filtered)
    $chartSummary = [
        'total'          => $transfers->count(),
        'completed'      => $transfers->where('status', 'completed')->count(),
        'pending_review' => $transfers->where('status', 'pending_review')->count(),
        'upcoming'       => $transfers->where('status', 'upcoming')->count(),
        'in_progress'    => $transfers->where('status', 'in_progress')->count(),
        'overdue'        => $transfers->where('status', 'overdue')->count(),
        'cancelled'      => $transfers->where('status', 'cancelled')->count(),
    ];

    $chartSource = $transfers;

    // Compute date range from scheduled_date (fallback to created_at)
    if (empty($from) && empty($to)) {
        $endDate = now()->endOfMonth();
        $startDate = now()->subMonths(5)->startOfMonth(); // ~6 months total
    } else {
        $minScheduled = $chartSource->min($dateField);
        $maxScheduled = $chartSource->max($dateField);
        $minCreated   = $chartSource->min('created_at');
        $maxCreated   = $chartSource->max('created_at');

        $startDate = $minScheduled ?: $minCreated;
        $endDate   = $maxScheduled ?: $maxCreated;
    }

    if ($startDate && $endDate) {
        $startDate = Carbon::parse($startDate);
        $endDate   = Carbon::parse($endDate);

        if ($startDate->diffInMonths($endDate) < 4) {
            $startDate = $startDate->copy()->subMonths(2);
            $endDate   = $endDate->copy()->addMonths(2);
        }

        $period = \Carbon\CarbonPeriod::create(
            $startDate->startOfMonth(),
            '1 month',
            $endDate->endOfMonth()
        );

        $statuses = ['completed', 'pending_review', 'upcoming', 'in_progress', 'overdue', 'cancelled'];

        $monthlyStatusTrends = collect($period)->map(function ($date) use ($chartSource, $dateField, $statuses) {
            $monthKey = $date->format('Y-m');

            $group = $chartSource->filter(function ($t) use ($monthKey, $dateField) {
                $d = $t->{$dateField} ?: $t->created_at;
                return Carbon::parse($d)->format('Y-m') === $monthKey;
            });

            $row = ['month' => $date->format('M Y')];

            foreach ($statuses as $status) {
                $row[$status] = $group->where('status', $status)->count();
            }

            return $row;
        })->values();
    } else {
        $monthlyStatusTrends = collect();
    }

    // ✅ Fetch buildings, departments, rooms
    $buildings   = Building::select('id','name')->get();
    $departments = UnitOrDepartment::select('id','name')->get();
    $rooms       = BuildingRoom::select('id','room as name','building_id')->get();

    return Inertia::render('reports/PropertyTransferReport', [
        'title'               => 'Property Transfer Report',
        'summary'             => $summary,
        'chartSummary'        => $chartSummary, // 👈 add this
        'monthlyStatusTrends' => $monthlyStatusTrends,
        'transfers'           => $transfers->map(fn($t) => [
            'id'                   => $t->id,
            'current_building'     => optional($t->currentBuildingRoom->building)->name,
            'current_room'         => optional($t->currentBuildingRoom)->room,
            'receiving_building'   => optional($t->receivingBuildingRoom->building)->name,
            'receiving_room'       => optional($t->receivingBuildingRoom)->room,
            'current_department'   => optional($t->currentOrganization)->name,
            'receiving_department' => optional($t->receivingOrganization)->name,
            'department'           => optional($t->currentOrganization)->name,
            'assigned_by'          => optional($t->assignedBy)->name,
            'status'               => $t->status,
            'assets'               => $t->transferAssets->count(),
            'created_at'           => $t->created_at->toDateTimeString(),
            'scheduled_date'       => optional($t->scheduled_date)->toDateTimeString() ?? null,
        ]),
        'filters'    => $request->only(['from','to','status','department_id','building_id','room_id']),
        'buildings'  => $buildings,
        'departments'=> $departments,
        'rooms'      => $rooms,
    ]);
}

}
