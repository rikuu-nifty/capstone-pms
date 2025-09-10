<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Report;
use Illuminate\Http\Request;
use App\Models\inventoryList;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Later: query data from inventory_lists, transfers, etc.
        // For now just render the page.
        return Inertia::render('reports/index', [
            'title' => 'Reports Dashboard',
        ]);
    }

        public function inventoryList()
    {
        // Example: group assets by category for chart
        $data = InventoryList::selectRaw('category_id, COUNT(*) as total')
            ->groupBy('category_id')
            ->with('category:id,name')
            ->get()
            ->map(fn($row) => [
                'label' => $row->category->name,
                'value' => $row->total,
            ]);

        return Inertia::render('reports/inventory-list', [
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
