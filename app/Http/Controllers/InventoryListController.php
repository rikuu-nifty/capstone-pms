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

    public function publicSummary(InventoryList $inventory_list)
    {
        $inventory_list->load([
            'assetModel.category',
            'category',
            'unitOrDepartment',
        ]);

        return Inertia::render('inventory-list/assetSummaryDetail', [
            'asset' => $inventory_list,
        ]);
    }

    public function showMemorandumReceipt(InventoryList $inventoryList)
    {
        $assets = InventoryList::with(['assetModel', 'unitOrDepartment', 'building', 'buildingRoom'])
            ->where('memorandum_no', $inventoryList->memorandum_no)
            ->get();

        return Inertia::render('inventory-list/ViewMemorandumReceipt', [
            'assets' => $assets,
            'memo_no' => $inventoryList->memorandum_no,
        ]);
    }


    public function index(Request $request)
    {
        return Inertia::render('inventory-list/index', $this->pageProps());
    }

    public function view(Request $request, InventoryList $inventory_list)
    {
        $inventory_list->load([
            'assetModel.category',
            'category',
            'unitOrDepartment',
            'building',
            'buildingRoom'
        ]);

        return Inertia::render('inventory-list/index', array_merge(
            $this->pageProps(),
            [
                'show_view_modal' => true,
                'viewing_asset'   => $inventory_list,
            ]
        ));
    }

    // 🔹 Extracted so you don’t repeat code
    private function pageProps(): array
    {
        $assets = InventoryList::with([
            'assetModel.category',
            'category',
            'unitOrDepartment',
            'building',
            'buildingRoom'
        ])->latest()->get();

        return [
            'assets' => $assets,
            'assetModels' => AssetModel::all(),
            'unitOrDepartments' => UnitOrDepartment::all(),
            'buildings' => Building::all(),
            'buildingRooms' => BuildingRoom::all(),
            'categories' => Category::all(),
            'kpis' => InventoryList::kpis(),
        ];
    }

    //   $assets = InventoryList::latest()->get();

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
        $data = $request->validated();

        // ✅ ensure maintenance_due_date is included
        if ($request->filled('maintenance_due_date')) {
            $data['maintenance_due_date'] = $request->input('maintenance_due_date');
        }

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('assets', 'public');
            $data['image_path'] = $path;
        }

        // 🚫 remove transfer_status so DB default applies
        unset($data['transfer_status']);

        // ✅ Bulk mode
        if ($request->input('mode') === 'bulk') {
            $created = [];
            $serialNumbers = $request->input('serial_numbers', []);
            $qty = (int) $request->input('quantity', 1);

            if (!empty($serialNumbers)) {
                foreach ($serialNumbers as $serial) {
                    $newData = $data;
                    $newData['serial_no'] = $serial;
                    $newData['quantity'] = 1;
                    $created[] = InventoryList::create($newData);
                }
            } else {
                for ($i = 0; $i < $qty; $i++) {
                    $newData = $data;
                    $newData['quantity'] = 1;
                    $created[] = InventoryList::create($newData);
                }
            }

            return redirect()->back()->with([
                'success' => count($created) . ' bulk assets added successfully.',
            ]);
        }

        // ✅ Single mode
        $asset = InventoryList::create($data);

        $asset->load([
            'assetModel.category',
            'unitOrDepartment',
            'building',
            'buildingRoom'
        ]);

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
            'category_id' => 'nullable|integer|exists:categories,id', //KABIT TO IF MERON TAYONG COLUMN FOR CATEGORY ID PERO WALA KASE CINACALL NATIN THROUGH MODEL
            'brand' => 'nullable|string|max:255',
            'memorandum_no' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            'date_purchased' => 'nullable|date',
            'maintenance_due_date' => 'nullable|date', // ✅ added here
            'transfer_status' => 'nullable|string|in:not_transferred,transferred,pending',
            'asset_model_id' => 'nullable|integer',
            'building_id' => 'nullable|exists:buildings,id',
            'building_room_id' => 'nullable|exists:building_rooms,id',
            'unit_or_department_id' => 'nullable|exists:unit_or_departments,id',
            'status' => 'nullable|string|in:active,archived',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // ✅ image validation
        ]);

        // ✅ ensure maintenance_due_date is passed
        if ($request->filled('maintenance_due_date')) {
            $data['maintenance_due_date'] = $request->input('maintenance_due_date');
        }

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('assets', 'public'); 
            $data['image_path'] = $path;
        }

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
