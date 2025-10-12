<?php

namespace App\Http\Controllers;
use App\Http\Requests\InventoryListAddNewAssetFormRequest;
use Inertia\Inertia;

use App\Models\AssetModel;
use App\Models\UnitOrDepartment;
use App\Models\Building;
use App\Models\BuildingRoom;
use App\Models\Category;
use App\Models\User;
use App\Models\SubArea;
use App\Models\Personnel;

use App\Models\InventoryList;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;



// Audit Trail
use App\Traits\LogsAuditTrail;

class InventoryListController extends Controller
{

    use LogsAuditTrail; 
    /**
     * Display a listing of the resource.
     */

    public function publicSummary(InventoryList $inventory_list)
    {
        $inventory_list->load([
            'assetModel.category',
            'category',
            'unitOrDepartment',
            'transfer', // view-all-inventory-listeager load transfer
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

    public function ownUnitIndex(Request $request)
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
            'buildingRoom',
            'transfer', // view-all-inventory-list eager load transfer
            'subArea',
            'schedulingAssets',

            'latestAssignment.assignment.personnel',
            'assetModel.equipmentCode',
            'equipmentCode',
            'turnoverDisposalAsset.turnoverDisposal',
            'offCampusAssets.offCampus',
        ]);

          // view-all-inventory-listLog the viewing action in audit_trails
         $this->logViewing($inventory_list);

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
        /** @var User $user */
        $user = Auth::user();

        $query = InventoryList::with([
            'assetModel.category',
            'category',
            'unitOrDepartment',
            'building',
            'buildingRoom.building',
            'roomBuilding',
            'transfer', // view-all-inventory-listeager load transfer
            'subArea',
            'transfers' => function ($q) {
                $q->latest('transfers.created_at'); // just order for accessor
            },
            'schedulingAssets',

            'latestAssignment.assignment.personnel',
            'assetModel.equipmentCode',
            'equipmentCode',
            'turnoverDisposalAsset.turnoverDisposal',
            'offCampusAssets.offCampus',
        ])
        ->orderBy('id', 'desc');

        if ($user && !$user->hasPermission('view-inventory-list')) {
            $query->where('unit_or_department_id', $user->unit_or_department_id);
        }

        $assets = $query->get();

        return [
            'assets'            => $assets,
            'assetModels'       => AssetModel::all(),
            'unitOrDepartments' => UnitOrDepartment::all(),
            'buildings'         => Building::all(),
            'buildingRooms'     => BuildingRoom::all(),
            'categories'        => Category::all(),
            'subAreas'          => SubArea::all(),
            // 'kpis'           => InventoryList::kpis(),
           'personnels'        => Personnel::activeForAssignments(), // view-all-inventory-list ill include id, full_name, position
            'kpis'              => InventoryList::kpis($user),
        ];
    }

    public function fetch(InventoryList $inventory_list) // DO NOT DELETE, THIS IS FOR ASSET ASSIGNMENT
    {
        $inventory_list->load([
            'assetModel.category',
            'category',
            'unitOrDepartment',
            'building',
            'buildingRoom',
            'subArea',
            'transfer',
            'schedulingAssets',
        ]);

        return response()->json($inventory_list);
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

    // Convert empty sub_area_id to null
    if (empty($data['sub_area_id'])) {
        $data['sub_area_id'] = null;
    }

        // view-all-inventory-listensure maintenance_due_date is included
        if ($request->filled('maintenance_due_date')) {
            $data['maintenance_due_date'] = $request->input('maintenance_due_date');
        }

    // ✅ Handle image upload to S3 if provided
    if ($request->hasFile('image')) {
        $file = $request->file('image');
        $original = $file->getClientOriginalName();
        $ext = $file->getClientOriginalExtension();
        $hash = sha1($original . microtime(true) . Str::random(16));
        $filename = "{$hash}.{$ext}";

        // Upload to S3 under 'asset_image/' folder, public visibility
        $path = Storage::disk('s3')->putFileAs('asset_image', $file, $filename, 'public');

        // ✅ Save full public URL instead of just path
        $data['image_path'] = Storage::disk('s3')->url($path);
    }

       // view-all-inventory-listBulk mode
if ($request->input('mode') === 'bulk') {
    $created = [];
    $serialNumbers = $request->input('serial_numbers', []);
    $qty = (int) $request->input('quantity', 1);

        if (!empty($serialNumbers)) {
            foreach ($serialNumbers as $serial) {
                $newData = $data;
                $newData['serial_no'] = $serial;
                $newData['quantity'] = 1;

                if ($request->filled('sub_area_id')) {
                    $newData['sub_area_id'] = $request->input('sub_area_id');
                }

                $asset = InventoryList::create($newData);
                $created[] = $asset;

            // view-all-inventory-listSync assignment if assigned_to is set
            if (!empty($newData['assigned_to'])) {
                $assignment = \App\Models\AssetAssignment::firstOrCreate(
                    ['personnel_id' => $newData['assigned_to']],
                    [
                        'assigned_by'   => auth()->id(),
                        'date_assigned' => now(),
                    ]
                );

                    \App\Models\AssetAssignmentItem::updateOrCreate(
                        ['asset_id' => $asset->id],
                        ['asset_assignment_id' => $assignment->id]
                    );
                }
            }
        } else {
            for ($i = 0; $i < $qty; $i++) {
                $newData = $data;
                $newData['quantity'] = 1;

                if ($request->filled('sub_area_id')) {
                    $newData['sub_area_id'] = $request->input('sub_area_id');
                }

                $asset = InventoryList::create($newData);
                $created[] = $asset;

            // view-all-inventory-listSync assignment if assigned_to is set
            if (!empty($newData['assigned_to'])) {
                $assignment = \App\Models\AssetAssignment::firstOrCreate(
                    ['personnel_id' => $newData['assigned_to']],
                    [
                        'assigned_by'   => auth()->id(),
                        'date_assigned' => now(),
                    ]
                );

                    \App\Models\AssetAssignmentItem::updateOrCreate(
                        ['asset_id' => $asset->id],
                        ['asset_assignment_id' => $assignment->id]
                    );
                }
            }
        }

        return redirect()->back()->with([
            'success' => count($created) . ' bulk assets added successfully.',
        ]);
    }

        // view-all-inventory-listSingle mode
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
            'category_id' => 'nullable|integer|exists:categories,id', 
            'brand' => 'nullable|string|max:255',
            'memorandum_no' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            'date_purchased' => 'nullable|date',
            'maintenance_due_date' => 'nullable|date',
            'depreciation_value' => 'nullable|numeric|min:0',
            'assigned_to' => 'nullable|integer|exists:personnels,id',
            'asset_model_id' => 'nullable|integer',
            'building_id' => 'nullable|exists:buildings,id',
            'building_room_id' => 'nullable|exists:building_rooms,id',
            'unit_or_department_id' => 'nullable|exists:unit_or_departments,id',
            'status' => 'nullable|string|in:active,archived',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'sub_area_id' => 'nullable|exists:sub_areas,id',
        ]);

        if (empty($data['sub_area_id'])) {
            $data['sub_area_id'] = null;
        }

        if ($request->filled('maintenance_due_date')) {
            $data['maintenance_due_date'] = $request->input('maintenance_due_date');
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('assets', 'public'); 
            $data['image_path'] = $path;
        }

        // view-all-inventory-listUpdate the inventory list
        $inventoryList->update($data);

        // view-all-inventory-listSync assignment if assigned_to is set
        if (!empty($data['assigned_to'])) {
            $latestAssignment = \App\Models\AssetAssignment::whereHas('items', function ($q) use ($inventoryList) {
                $q->where('asset_id', $inventoryList->id);
            })->latest()->first();

            if (!$latestAssignment || $latestAssignment->personnel_id != $data['assigned_to']) {
                $assignment = \App\Models\AssetAssignment::firstOrCreate(
                    ['personnel_id' => $data['assigned_to']],
                    [
                        'assigned_by'   => auth()->id(),
                        'date_assigned' => now(),
                    ]
                );

                \App\Models\AssetAssignmentItem::updateOrCreate(
                    ['asset_id' => $inventoryList->id],
                    ['asset_assignment_id' => $assignment->id]
                );
            }
        } else {
            // view-all-inventory-listClear assignment if null
            \App\Models\AssetAssignmentItem::where('asset_id', $inventoryList->id)->delete();
        }

        // view-all-inventory-listALWAYS return
        return redirect()->back()->with('success', 'Asset updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
   public function destroy(Request $request, InventoryList $inventoryList)
    {
        // view-all-inventory-listTrack who archived it (requires nullable inventory_lists.deleted_by_id column)
        $inventoryList->forceFill(['deleted_by_id' => $request->user()->id ?? null])->save();

        // view-all-inventory-listSoft delete (archive asset)
        $inventoryList->delete();

        return back()->with('success', 'Asset archived successfully.');
    }

    public function restore(int $id)
    {
        // view-all-inventory-listInclude trashed to find archived asset
        $inventoryList = InventoryList::withTrashed()->findOrFail($id);
        $inventoryList->restore(); 

        return back()->with('success', 'Asset restored successfully.');
    }

    public function forceDelete(int $id)
    {
        $inventoryList = InventoryList::withTrashed()->findOrFail($id);

        // view-all-inventory-listIf you want to truly purge asset and children (like related transfer_assets)
        $inventoryList->forceDelete();

        return back()->with('success', 'Asset permanently removed.');
    }
}
