<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

use App\Models\User;

use App\Models\InventoryList;
use App\Models\Category;
use App\Models\Transfer;
use App\Models\TurnoverDisposal;
use App\Models\OffCampus;
use App\Models\Building;
use App\Models\BuildingRoom;
use App\Models\UnitOrDepartment;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    // public function index()
    // {
    //     // Assets by Building
    //     $buildings = Building::withCount('inventoryLists')
    //         ->get(['id', 'name'])
    //         ->map(fn($b) => [
    //             'location' => $b->name,
    //             'assets'   => $b->inventory_lists_count,
    //         ]);

    //     // Assets by Department (with building name)
    //     $departments = InventoryList::select(
    //             'unit_or_departments.name as dept_name',
    //             'buildings.name as building_name',
    //             DB::raw('COUNT(inventory_lists.id) as assets')
    //         )
    //         ->join('unit_or_departments', 'inventory_lists.unit_or_department_id', '=', 'unit_or_departments.id')
    //         ->join('buildings', 'inventory_lists.building_id', '=', 'buildings.id')
    //         ->groupBy('unit_or_departments.name', 'buildings.name')
    //         ->get()
    //         ->map(fn($row) => [
    //             'location' => $row->dept_name . ' (' . $row->building_name . ')',
    //             'assets'   => $row->assets,
    //         ]);

    //     // Assets by Room (with building name)
    //     $rooms = InventoryList::select(
    //             'building_rooms.room as room_name',
    //             'buildings.name as building_name',
    //             DB::raw('COUNT(inventory_lists.id) as assets')
    //         )
    //         ->join('building_rooms', 'inventory_lists.building_room_id', '=', 'building_rooms.id')
    //         ->join('buildings', 'inventory_lists.building_id', '=', 'buildings.id')
    //         ->groupBy('building_rooms.room', 'buildings.name')
    //         ->get()
    //         ->map(fn($row) => [
    //             'location' => $row->room_name . ' (' . $row->building_name . ')',
    //             'assets'   => $row->assets,
    //         ]);

    //     // calculate this month's and last month's asset counts
    //     $thisMonth = InventoryList::whereMonth('created_at', now()->month)
    //         ->whereYear('created_at', now()->year)
    //         ->count();

    //     $lastMonth = InventoryList::whereMonth('created_at', now()->subMonth()->month)
    //         ->whereYear('created_at', now()->subMonth()->year)
    //         ->count();

    //     // compute % change
    //     $assetTrend = $lastMonth > 0
    //         ? (($thisMonth - $lastMonth) / $lastMonth) * 100
    //         : ($thisMonth > 0 ? 100 : 0);

    //     // Categories with asset counts (limit to top 9, group the rest as "Others")
    //     $categories = Category::withCount('inventoryLists')
    //         ->orderByDesc('inventory_lists_count')
    //         ->get(['id', 'name'])
    //         ->map(fn($cat) => [
    //             'name'  => $cat->name,
    //             'count' => $cat->inventory_lists_count,
    //         ]);

    //     if ($categories->count() > 10) {
    //         $top = $categories->take(9);
    //         $others = $categories->slice(9)->sum('count');
    //         $categories = $top->push([
    //             'name'  => 'Others',
    //             'count' => $others,
    //         ]);
    //     }

    //     // Assets Over Time (last 6 months: added, disposed, transferred, cumulative)
    //     $months = collect(range(0, 5))
    //         ->map(fn($i) => Carbon::now()->subMonths($i)->format('F Y')) // match query format
    //         ->reverse()
    //         ->values();

    //     $assetsAdded = InventoryList::selectRaw("
    //             DATE_FORMAT(created_at, '%Y-%m') as ym,
    //             DATE_FORMAT(created_at, '%M %Y') as month,
    //             COUNT(*) as total
    //         ")
    //         ->where('created_at', '>=', now()->subMonths(6))
    //         ->groupBy('ym', 'month')
    //         ->orderBy('ym')
    //         ->pluck('total', 'month');

    //     $assetsDisposed = TurnoverDisposal::selectRaw("
    //             DATE_FORMAT(created_at, '%Y-%m') as ym,
    //             DATE_FORMAT(created_at, '%M %Y') as month,
    //             COUNT(*) as total
    //         ")
    //         ->where('created_at', '>=', now()->subMonths(6))
    //         ->groupBy('ym', 'month')
    //         ->orderBy('ym')
    //         ->pluck('total', 'month');

    //     $assetsTransferred = Transfer::selectRaw("
    //             DATE_FORMAT(created_at, '%Y-%m') as ym,
    //             DATE_FORMAT(created_at, '%M %Y') as month,
    //             COUNT(*) as total
    //         ")
    //         ->where('created_at', '>=', now()->subMonths(6))
    //         ->groupBy('ym', 'month')
    //         ->orderBy('ym')
    //         ->pluck('total', 'month');

    //     // Build cumulative active asset counts
    //     $runningTotal = 0;
    //     $assetsOverTime = $months->map(function ($month) use ($assetsAdded, $assetsDisposed, $assetsTransferred, &$runningTotal) {
    //         $added     = $assetsAdded[$month] ?? 0;
    //         $disposed  = $assetsDisposed[$month] ?? 0;
    //         $transfers = $assetsTransferred[$month] ?? 0;

    //         // Increase running total
    //         $runningTotal += $added;
    //         $runningTotal -= $disposed; // subtract disposed from active pool

    //         return [
    //             'month'      => $month,
    //             'added'      => $added,
    //             'disposed'   => $disposed,
    //             'transfers'  => $transfers,
    //             'cumulative' => max($runningTotal, 0), // never go below 0
    //         ];
    //     });

    //     return Inertia::render('dashboard/index', [
    //         'stats' => [
    //             'totalAssets'        => InventoryList::count(),
    //             'activeTransfers'    => Transfer::where('status', 'in_progress')->count(),
    //             // 'pendingRequests'    => TurnoverDisposal::where('status', 'pending')->count(),
    //             'pendingRequests' => TurnoverDisposal::where('type', 'turnover')
    //                 ->whereIn('status', ['pending_review', 'approved'])
    //                 ->count(),

    //             'completedThisMonth' => Transfer::whereMonth('created_at', now()->month)
    //                                             ->whereYear('created_at', now()->year)
    //                                             ->where('status', 'completed')
    //                                             ->count(),
    //             'offCampusAssets' => OffCampus::whereNotIn('status', 
    //                 [
    //                     'returned', 'cancelled', 'missing',
    //                 ]
    //             )->count(),

    //         ],

    //         'recentTransfers' => Transfer::latest()
    //             ->take(5)
    //             ->get(['id', 'status', 'created_at']),

    //         'categories'      => $categories,   // now passed properly
    //         'assetTrend'      => round($assetTrend, 1),
    //         'buildings'       => $buildings,
    //         'rooms'           => $rooms,
    //         'departments'     => $departments,
    //         'assetsOverTime'  => $assetsOverTime, // new dataset with cumulative
    //     ]);
    // }

    public function index()
    {
        /** @var User $user */
        $user = Auth::user();

        // Ensure the relation is loaded (important for view-own-unit users)
        $user->loadMissing('unitOrDepartment');

        // Determine permission scope using your existing hasPermission() method
        $canViewAll = $user->hasPermission('view-inventory-list');
        $canViewOwn = $user->hasPermission('view-own-unit-inventory-list');
        $unitId = $user->unit_or_department_id;

        // Base queries
        $inventoryQuery = InventoryList::query();
        $transferQuery = Transfer::query();
        $turnoverQuery = TurnoverDisposal::query();
        $offCampusQuery = OffCampus::query();

        $unitId = $user->unit_or_department_id ?: null;

        if ($canViewOwn && !$canViewAll && $unitId) {
            $inventoryQuery->where('unit_or_department_id', $unitId);

            $transferQuery->where(function ($q) use ($unitId) {
                $q->where('current_organization', $unitId)
                    ->orWhere('receiving_organization', $unitId);
            });

            $turnoverQuery->where(function ($q) use ($unitId) {
                $q->where('issuing_office_id', $unitId)
                    ->orWhere('receiving_office_id', $unitId);
            });

            $offCampusQuery->where('college_or_unit_id', $unitId);
        }


        // 🧮 KPI cards
        $stats = [
            'totalAssets'        => $inventoryQuery->count(),
            'activeTransfers'    => $transferQuery->where('status', 'in_progress')->count(),
            'pendingRequests'    => (clone $turnoverQuery)
                ->where('type', 'turnover')
                ->whereIn('status', ['pending_review', 'approved'])
                ->count(),
            'completedThisMonth' => (clone $transferQuery)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->where('status', 'completed')
                ->count(),
            'offCampusAssets'    => (clone $offCampusQuery)
                ->whereNotIn('status', ['returned', 'cancelled', 'missing'])
                ->count(),
        ];

        // 🏢 Assets by Building
        $buildings = Building::withCount(['inventoryLists as inventory_lists_count' => function ($q) use ($canViewAll, $unitId) {
            if (!$canViewAll && $unitId) {
                $q->where('unit_or_department_id', $unitId);
            }
        }])
            ->get(['id', 'name'])
            ->map(fn($b) => [
                'location' => $b->name,
                'assets'   => $b->inventory_lists_count,
            ]);

        // 🏬 Assets by Department
        $departments = InventoryList::select(
            'unit_or_departments.name as dept_name',
            'buildings.name as building_name',
            DB::raw('COUNT(inventory_lists.id) as assets')
        )
            ->join('unit_or_departments', 'inventory_lists.unit_or_department_id', '=', 'unit_or_departments.id')
            ->join('buildings', 'inventory_lists.building_id', '=', 'buildings.id')
            ->when(!$canViewAll && $unitId, fn($q) => $q->where('inventory_lists.unit_or_department_id', $unitId))
            ->groupBy('unit_or_departments.name', 'buildings.name')
            ->get()
            ->map(fn($row) => [
                'location' => "{$row->dept_name} ({$row->building_name})",
                'assets'   => $row->assets,
            ]);

        // 🏠 Assets by Room
        $rooms = InventoryList::select(
            'building_rooms.room as room_name',
            'buildings.name as building_name',
            DB::raw('COUNT(inventory_lists.id) as assets')
        )
            ->join('building_rooms', 'inventory_lists.building_room_id', '=', 'building_rooms.id')
            ->join('buildings', 'inventory_lists.building_id', '=', 'buildings.id')
            ->when(!$canViewAll && $unitId, fn($q) => $q->where('inventory_lists.unit_or_department_id', $unitId))
            ->groupBy('building_rooms.room', 'buildings.name')
            ->get()
            ->map(fn($row) => [
                'location' => "{$row->room_name} ({$row->building_name})",
                'assets'   => $row->assets,
            ]);

        // 📊 Categories
        $categories = Category::withCount(['inventoryLists as inventory_lists_count' => function ($q) use ($canViewAll, $unitId) {
            if (!$canViewAll && $unitId) {
                $q->where('unit_or_department_id', $unitId);
            }
        }])
            ->orderByDesc('inventory_lists_count')
            ->get(['id', 'name'])
            ->map(fn($cat) => [
                'name'  => $cat->name,
                'count' => $cat->inventory_lists_count,
            ]);

        if ($categories->count() > 10) {
            $top = $categories->take(9);
            $others = $categories->slice(9)->sum('count');
            $categories = $top->push([
                'name' => 'Others',
                'count' => $others,
            ]);
        }

        // 📈 Assets over time
        $months = collect(range(0, 5))
            ->map(fn($i) => now()->subMonths($i)->format('F Y'))
            ->reverse()
            ->values();

        $assetsAdded = (clone $inventoryQuery)
            ->selectRaw("DATE_FORMAT(created_at, '%M %Y') as month, COUNT(*) as total")
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->pluck('total', 'month');

        $assetsDisposed = (clone $turnoverQuery)
            ->selectRaw("DATE_FORMAT(created_at, '%M %Y') as month, COUNT(*) as total")
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->pluck('total', 'month');

        $assetsTransferred = (clone $transferQuery)
            ->selectRaw("DATE_FORMAT(created_at, '%M %Y') as month, COUNT(*) as total")
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->pluck('total', 'month');

        $runningTotal = 0;
        $assetsOverTime = $months->map(function ($month) use ($assetsAdded, $assetsDisposed, $assetsTransferred, &$runningTotal) {
            $added     = $assetsAdded[$month] ?? 0;
            $disposed  = $assetsDisposed[$month] ?? 0;
            $transfers = $assetsTransferred[$month] ?? 0;

            $runningTotal += $added;
            $runningTotal -= $disposed;

            return [
                'month'      => $month,
                'added'      => $added,
                'disposed'   => $disposed,
                'transfers'  => $transfers,
                'cumulative' => max($runningTotal, 0),
            ];
        });

        // 📊 % Trend
        $thisMonth = (clone $inventoryQuery)->whereMonth('created_at', now()->month)->count();
        $lastMonth = (clone $inventoryQuery)->whereMonth('created_at', now()->subMonth()->month)->count();
        $assetTrend = $lastMonth > 0
            ? (($thisMonth - $lastMonth) / $lastMonth) * 100
            : ($thisMonth > 0 ? 100 : 0);

        return Inertia::render('dashboard/index', [
            'stats'          => $stats,
            'categories'     => $categories,
            'assetTrend'     => round($assetTrend, 1),
            'buildings'      => $buildings,
            'rooms'          => $rooms,
            'departments'    => $departments,
            'assetsOverTime' => $assetsOverTime,
        ]);
    }
}
