<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use App\Models\Report;
use Illuminate\Http\Request;
use App\Models\InventoryList;
use App\Models\Category;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // ✅ Fetch all categories and count their assets
        $categoryData = Category::withCount('inventoryLists')
            ->get()
            ->map(fn($cat) => [
                'label' => $cat->name,
                'value' => $cat->inventory_lists_count ?? 0, // default to 0
            ]);

        return Inertia::render('reports/index', [
            'title' => 'Reports Dashboard',
            'categoryData' => $categoryData,
        ]);
    }

    public function inventoryList()
    {
        // ✅ Fetch categories with asset counts for the Inventory List Report
        $data = Category::withCount('inventoryLists')
            ->get()
            ->map(fn($cat) => [
                'label' => $cat->name,
                'value' => $cat->inventory_lists_count ?? 0,
            ]);

        // ✅ Point to your renamed React component
        return Inertia::render('reports/InventoryListReport', [
            'chartData' => $data,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
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
