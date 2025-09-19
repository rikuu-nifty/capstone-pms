<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use App\Models\Report;
use Illuminate\Http\Request;
use App\Models\InventoryList;
use App\Models\UnitOrDepartment;
use App\Models\AssetModel;
use App\Models\Building;
use App\Models\Category;
use App\Models\BuildingRoom;
use App\Models\SubArea;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\InventoryListReportExport;
use App\Exports\NewPurchasesSummaryExport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */

   public function exportExcel(Request $request)
    {
        $filters = $request->all();

            if (($filters['report_type'] ?? null) === 'new_purchases') {
                return Excel::download(
                    new NewPurchasesSummaryExport($filters),
                    'SummaryOfNewlyPurchasedEquipmentReport.xlsx'
                );
            }

            return Excel::download(
                new InventoryListReportExport($filters),
                'InventoryListReport.xlsx'
            );
    }

    public function exportPdf(Request $request)
    {
        // Build the same filtered query you use for the screen
        $assets = InventoryList::with(['assetModel', 'category', 'unitOrDepartment', 'building', 'buildingRoom'])
            ->when($request->filled('from'), fn($q) => $q->whereDate('date_purchased', '>=', $request->input('from')))
            ->when($request->filled('to'), fn($q) => $q->whereDate('date_purchased', '<=', $request->input('to')))
            ->when($request->filled('department_id'), fn($q) => $q->where('unit_or_department_id', $request->input('department_id')))
            ->when($request->filled('category_id'), fn($q) => $q->where('category_id', $request->input('category_id')))
            ->when($request->filled('asset_type'), fn($q) => $q->where('asset_type', $request->input('asset_type')))
            ->when($request->filled('supplier'), fn($q) => $q->where('supplier', $request->input('supplier')))
            ->when($request->filled('condition'), fn($q) => $q->where('condition', $request->input('condition')))
            ->when($request->filled('cost_min'), fn($q) => $q->where('unit_cost', '>=', $request->input('cost_min')))
            ->when($request->filled('cost_max'), fn($q) => $q->where('unit_cost', '<=', $request->input('cost_max')))
            ->when($request->filled('building_id'), fn($q) => $q->where('building_id', $request->input('building_id')))
            ->when($request->filled('brand'), fn($q) =>
                $q->whereHas('assetModel', fn($aq) => $aq->where('brand', $request->input('brand')))
        )
        ->get();

        // ✅ Asset Type mapping
        $assetTypeLabels = [
            'fixed' => 'Fixed',
            'not_fixed' => 'Not Fixed',
        ];

        // ✅ Map asset_type for each asset
        $assets = $assets->map(function ($a) use ($assetTypeLabels) {
            $a->asset_type = $assetTypeLabels[$a->asset_type] ?? ($a->asset_type ?? '-');
            return $a;
        });

        // Derived values for the template
        $totals = [
            'count'       => $assets->count(),
            'total_cost'  => $assets->sum('unit_cost'),   // if you store unit_cost per asset
        ];

        // Get filters from request
        $filters = $request->only([
            'from','to','department_id','category_id','asset_type','supplier',
            'condition','cost_min','cost_max','building_id','brand','report_type'
        ]);

        // ✅ Replace IDs with actual names for display
        if (!empty($filters['department_id'])) {
            $filters['department_id'] = UnitOrDepartment::find($filters['department_id'])->name ?? $filters['department_id'];
        }
        if (!empty($filters['category_id'])) {
            $filters['category_id'] = Category::find($filters['category_id'])->name ?? $filters['category_id'];
        }
        if (!empty($filters['building_id'])) {
            $filters['building_id'] = Building::find($filters['building_id'])->name ?? $filters['building_id'];
        }
        // ✅ Map asset_type filter value
        if (!empty($filters['asset_type'])) {
            $filters['asset_type'] = $assetTypeLabels[$filters['asset_type']] ?? $filters['asset_type'];
        }

        // ✅ Normalize and choose the Blade view based on report_type
        $reportType = $request->input('report_type', 'inventory_list');

        switch ($reportType) {
            case 'new_purchases':
                $view = 'reports.new_purchases';
                $fileName = 'SummaryOfNewlyPurchasedEquipmentReport.pdf';
                break;

            case 'inventory_list':
            default:
                $view = 'reports.inventory_list_pdf';
                $fileName = 'InventoryListReport.pdf';
                break;
        }

        $pdf = Pdf::loadView($view, [
                'assets'  => $assets,
                'filters' => $filters,
                'totals'  => $totals,
            ])
            ->setPaper('a4', 'landscape');

        return $pdf->download($fileName);
    }

    public function index()
    {
        // ✅ Fetch all categories and count their assets
        $categoryData = Category::withCount('inventoryLists')
            ->get()
            ->map(fn($cat) => [
                'label' => $cat->name,
                'value' => $cat->inventory_lists_count ?? 0, // default to 0
            ]);

        $startDate = Carbon::now()->subDays(90)->toDateString();

        // INVENTORY SHEET REPORTS PART
        // $chartQuery = InventoryList::with(['schedulingAssets'])->get();
        $chartQuery = InventoryList::with(['schedulingAssets'])
            ->whereHas('schedulingAssets', function ($q) use ($startDate) {
                $q->whereDate('created_at', '>=', $startDate)
                    ->orWhereDate('inventoried_at', '>=', $startDate);
            })
            ->get();

        $chartData = $chartQuery->flatMap(function ($asset) {
            return $asset->schedulingAssets->map(function ($s) {
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

        $inventorySheetChartData = $chartData
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


        return Inertia::render('reports/index', [
            'title' => 'Reports Dashboard',
            'categoryData' => $categoryData,
            'inventorySheetChartData' => $inventorySheetChartData,
        ]);
    }

    public function inventoryList(Request $request)
    {
        // ✅ Start from categories
        $query = Category::query()
            ->leftJoin('inventory_lists', 'categories.id', '=', 'inventory_lists.category_id');

        // ✅ Join asset_models for brand filtering
        $query->leftJoin('asset_models', 'inventory_lists.asset_model_id', '=', 'asset_models.id');

        // ✅ Apply filters on inventory_lists
        if ($request->filled('from')) {
            $query->whereDate('inventory_lists.date_purchased', '>=', $request->input('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('inventory_lists.date_purchased', '<=', $request->input('to'));
        }
        if ($request->filled('department_id')) {
            $query->where('inventory_lists.unit_or_department_id', $request->input('department_id'));
        }
        if ($request->filled('category_id')) {
            $query->where('inventory_lists.category_id', $request->input('category_id'));
        }
        if ($request->filled('asset_type')) {
            $query->where('inventory_lists.asset_type', $request->input('asset_type'));
        }
        if ($request->filled('supplier')) {
            $query->where('inventory_lists.supplier', $request->input('supplier'));
        }
        if ($request->filled('condition')) {
            $query->where('inventory_lists.condition', $request->input('condition'));
        }
        if ($request->filled('cost_min')) {
            $query->where('inventory_lists.unit_cost', '>=', $request->input('cost_min'));
        }
        if ($request->filled('cost_max')) {
            $query->where('inventory_lists.unit_cost', '<=', $request->input('cost_max'));
        }
        if ($request->filled('building_id')) {
            $query->where('inventory_lists.building_id', $request->input('building_id'));
        }

        // ✅ Brand filter via joined asset_models
        if ($request->filled('brand')) {
            $query->where('asset_models.brand', $request->input('brand'));
        }

        // ✅ FIX: prevent duplicate counting by using DISTINCT
        $chartData = $query
            ->select('categories.name as label')
            ->selectRaw('COUNT(DISTINCT inventory_lists.id) as value') // 👈 important fix
            ->groupBy('categories.id', 'categories.name')
            // ->orderBy('categories.name') Alphabetical Order
            ->orderBy('categories.created_at')
            ->get();

         // ✅ Asset type label mapping
    $assetTypeLabels = [
        'fixed' => 'Fixed',
        'not_fixed' => 'Not Fixed',
    ];

    // ✅ Fetch assets with all filters applied
    $assets = InventoryList::with(['assetModel', 'category', 'unitOrDepartment', 'building', 'buildingRoom'])
        ->when($request->filled('from'), fn($q) => $q->whereDate('date_purchased', '>=', $request->input('from')))
        ->when($request->filled('to'), fn($q) => $q->whereDate('date_purchased', '<=', $request->input('to')))
        ->when($request->filled('department_id'), fn($q) => $q->where('unit_or_department_id', $request->input('department_id')))
        ->when($request->filled('category_id'), fn($q) => $q->where('category_id', $request->input('category_id')))
        ->when($request->filled('asset_type'), fn($q) => $q->where('asset_type', $request->input('asset_type')))
        ->when($request->filled('supplier'), fn($q) => $q->where('supplier', $request->input('supplier')))
        ->when($request->filled('condition'), fn($q) => $q->where('condition', $request->input('condition')))
        ->when($request->filled('cost_min'), fn($q) => $q->where('unit_cost', '>=', $request->input('cost_min')))
        ->when($request->filled('cost_max'), fn($q) => $q->where('unit_cost', '<=', $request->input('cost_max')))
        ->when($request->filled('building_id'), fn($q) => $q->where('building_id', $request->input('building_id')))
        ->when($request->filled('brand'), fn($q) =>
            $q->whereHas('assetModel', fn($aq) => $aq->where('brand', $request->input('brand')))
        )
        ->get();

    // ✅ Build counts from assets
    $assetCounts = $assets
        ->groupBy(fn($a) => $a->category?->id)
        ->map(fn($group) => $group->count());

    // ✅ Ensure all categories are included (even if 0)
    $chartData = Category::select('id', 'name')
        ->orderBy('created_at')
        ->get()
        ->map(fn($cat) => [
            'label' => $cat->name,
            'value' => $assetCounts[$cat->id] ?? 0,
        ]);

    // ✅ Map assets for frontend
    $assets = $assets->map(fn($a) => [
        'id'             => $a->id,
        'asset_name'     => $a->asset_name,
        'brand'          => $a->assetModel?->brand ?? '-',
        'model'          => $a->assetModel?->model ?? '-',
        'category'       => $a->category?->name ?? '-',
        'department'     => $a->unitOrDepartment?->name ?? '-',
        'building'       => $a->building?->name ?? '-',
        'room'           => $a->buildingRoom?->room ?? '-',
        'supplier'       => $a->supplier ?? '-',
        'asset_type'     => $assetTypeLabels[$a->asset_type] ?? ($a->asset_type ?? '-'),
        'date_purchased' => $a->date_purchased,
        'unit_cost'      => $a->unit_cost ?? '-',
        'memorandum_no'  => $a->memorandum_no ?? '-',
    ]);

        // ✅ define reportType before returning
    $reportType = $request->input('report_type', 'inventory_list');

        return Inertia::render('reports/InventoryListReport', [
            'chartData'   => $chartData,
            'assets'      => $assets,
            'departments' => UnitOrDepartment::select('id', 'name')->get(),
            'categories'  => Category::select('id', 'name')->get(),
            'suppliers'   => InventoryList::select('supplier')->distinct()->pluck('supplier')->filter()->values(),
            'assetTypes'  => [
                ['value' => 'fixed', 'label' => 'Fixed'],
                ['value' => 'not_fixed', 'label' => 'Not Fixed'],
            ],
            'buildings'   => Building::select('id', 'name')->get(),
            'brands'      => AssetModel::select('brand')->distinct()->pluck('brand')->filter()->values(),
            'reportType'  => $reportType, // ✅ pass to frontend
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Report $report)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Report $report)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Report $report)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Report $report)
    {
        //
    }
}
