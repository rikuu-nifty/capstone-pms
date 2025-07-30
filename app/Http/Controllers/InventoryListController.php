<?php

namespace App\Http\Controllers;
use App\Http\Requests\InventoryListAddNewAssetFormRequest;
use Inertia\Inertia;

use App\Models\AssetModel;
use App\Models\UnitOrDepartment;
use App\Models\Building;
use App\Models\BuildingRoom;
use App\Models\Category;

use App\Models\InventoryList;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;


class InventoryListController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $assets = InventoryList::with([
            'assetModel.category',
            'unitOrDepartment',
            'building',
            'buildingRoom'
        ])->latest()->get();

        $assetModels = AssetModel::all();
        $unitOrDepartment = UnitOrDepartment::all();
        $buildings = Building::all();
        $buildingRooms = BuildingRoom::all();
        $categories = Category::all();

        return Inertia::render('inventory-list/index', [
            'assets' => $assets,
            'assetModels' => $assetModels,
            'unitOrDepartments' => $unitOrDepartment,
            'buildings' => $buildings,
            'buildingRooms' => $buildingRooms,
            'categories' => $categories,
        ]);
    }





    //    $assets = InventoryList::latest()->get();

    //   $assets = inventoryList::with([
    //         'assetModel.category',
    //         'unitOrDepartment',
    //         'building',
    //         'buildingRoom'
    //     ])->latest()->get();
  
    //     return Inertia::render('inventory-list/index', [
    //         'assets' => $assets,
    //         'units' => $units,  for dropdown, display, etc.
            
    //     ]);

        // 'inventory-list' => inventoryList::paginate(10)->withQueryString(),
        // return Inertia::render('inventory-list/index');
            
    

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {   

        // return Inertia::render('inventory-list/add-asset-form');

    }

    /**
     * Store a newly created resource in storage.
     * @param InventoryListAddNewAssetFormRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(InventoryListAddNewAssetFormRequest $request): RedirectResponse
    {
        // dd($request->all()); 
        // dd($data); // What made it through validation

        //  $data = $request->all();
        //  InventoryList::create($data);
        //  return redirect()->back()->with('success', 'Asset added successfully.');

        // Get validated input
        $data = $request->validated();

         // Save to database
        $asset = InventoryList::create($data);

         // Load FK relationships
        $asset->load([
            'assetModel.category',
            'unitOrDepartment',
            'building',
            'buildingRoom'
        ]);

        // Redirect back with success message and full asset
        return redirect()->back()->with([
            'success' => 'Asset added successfully.',
            'newAsset' => $asset,
            ]);


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
public function update(Request $request, InventoryList $inventoryList): RedirectResponse
{
    $data = $request->validate([
        'asset_name' => 'nullable|string|max:255',
        'supplier' => 'nullable|string|max:255',
        'serial_no' => 'nullable|string|max:255',
        'unit_cost' => 'nullable|numeric|min:0',
        'quantity' => 'nullable|integer|min:1',
        'asset_type' => 'nullable|string|max:255',
        'brand' => 'nullable|string|max:255',
        'memorandum_no' => 'nullable|numeric|min:0',
        'description' => 'nullable|string|max:1000',
        'date_purchased' => 'nullable|date',
        'transfer_status' => 'nullable|string|in:not_transferred,transferred,pending',
        'asset_model_id' => 'nullable|integer',
        'building_id' => 'nullable|exists:buildings,id',
        'building_room_id' => 'nullable|exists:building_rooms,id',
        'unit_or_department_id' => 'nullable|exists:unit_or_departments,id',
        'status' => 'nullable|string|in:active,archived',

    ]);

    $inventoryList->update($data);

    return redirect()->back()->with('success', 'Asset updated successfully.');
}




    /**
     * Remove the specified resource from storage.
     */
    public function destroy(inventoryList $inventoryList)
    {
        $inventoryList->delete();
        return redirect()->back()->with('success', 'Asset deleted successfully.');
    }
}
