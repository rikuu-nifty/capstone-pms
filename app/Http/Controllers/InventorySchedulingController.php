<?php

namespace App\Http\Controllers;
// use App\Http\Requests\InventoryListAddNewAssetFormRequest;
use Inertia\Inertia;

use App\Models\InventoryScheduling;
use App\Models\UnitOrDepartment;
use App\Models\Building;
use App\Models\BuildingRoom;
use App\Models\User;

use Illuminate\Http\Request;

class InventorySchedulingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('inventory-scheduling/index', [
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
    public function show(InventoryScheduling $inventoryScheduling)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(InventoryScheduling $inventoryScheduling)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, InventoryScheduling $inventoryScheduling)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(InventoryScheduling $inventoryScheduling)
    {
        //
    }
}
