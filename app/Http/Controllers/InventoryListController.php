<?php

namespace App\Http\Controllers;
use App\Http\Requests\InventoryListAddNewAssetFormRequest;
use Inertia\Inertia;

use App\Models\AssetModel;
use App\Models\UnitOrDepartment;
use App\Models\Building;
use App\Models\BuildingRoom;

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

        return Inertia::render('inventory-list/index', [
            'assets' => $assets,
            'assetModels' => $assetModels,
            'unitOrDepartments' => $unitOrDepartment,
            'buildings' => $buildings,
            'buildingRooms' => $buildingRooms,
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
