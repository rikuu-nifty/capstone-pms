<?php

namespace App\Http\Controllers;
use App\Http\Requests\InventoryListAddNewAssetFormRequest;
use Inertia\Inertia;
use App\Models\inventoryList;
use Illuminate\Http\Request;


class InventoryListController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('inventory-list/index', [
            'inventory-list' => inventoryList::paginate(10)->withQueryString(),
        ]);

        // return Inertia::render('inventory-list/index');
            
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {   

        // return Inertia::render('inventory-list/add-asset-form');

    }

    /**
     * Store a newly created resource in storage.
     * @param InventoryListAddNewAssetFormRequest 
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(InventoryListAddNewAssetFormRequest $request)
    {
        dd($request->all());
    }

    /**
     * Display the specified resource.
     */
    public function show(inventoryList $inventoryList)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(inventoryList $inventoryList)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, inventoryList $inventoryList)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(inventoryList $inventoryList)
    {
        //
    }
}
