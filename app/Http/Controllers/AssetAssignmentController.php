<?php

namespace App\Http\Controllers;

use App\Models\AssetAssignment;
use App\Models\AssetAssignmentItem;
use App\Models\Personnel;
use App\Models\UnitOrDepartment;
use App\Models\InventoryList;
use App\Models\User;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AssetAssignmentController extends Controller
{
    private function indexProps(Request $request): array
    {
        $perPage = $request->input('per_page', 10);

        return AssetAssignment::indexData($perPage) + [
            'currentUser' => $request->user()
                ? ['id' => $request->user()->id, 'name' => $request->user()->name]
                : null,
            'users' => User::select('id', 'name')->get(),
        ];
    }

    public function index(Request $request)
    {
        return Inertia::render('assignments/index', $this->indexProps($request));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'personnel_id'      => ['required', Rule::exists('personnels', 'id')],
            'assigned_by'       => ['sometimes', Rule::exists('users', 'id')],
            'date_assigned'     => ['required', 'date'],
            'remarks'           => ['nullable', 'string'],
            'selected_assets'   => ['required', 'array', 'min:1'],
            'selected_assets.*' => ['integer', Rule::exists('inventory_lists', 'id')],
        ]);

        DB::transaction(function () use ($data, $request) {
            $assignment = AssetAssignment::create([
                'personnel_id'  => $data['personnel_id'],
                'assigned_by'   => $data['assigned_by'] ?? $request->user()->id,
                'date_assigned' => $data['date_assigned'] ?: now()->toDateString(),
                'remarks'       => $data['remarks'] ?? null,
            ]);

            // Attach assets and sync assigned_to
            foreach ($data['selected_assets'] as $assetId) {
                AssetAssignmentItem::create([
                    'asset_assignment_id' => $assignment->id,
                    'asset_id'            => $assetId,
                ]);

                InventoryList::where('id', $assetId)->update([
                    'assigned_to' => $assignment->personnel_id,
                ]);
            }
        });

        return redirect()->route('assignments.index')->with('success', "Assets assigned successfully.");
    }

    public function update(Request $request, AssetAssignment $assignment)
    {
        $data = $request->validate([
            'personnel_id'      => ['required', Rule::exists('personnels', 'id')],
            'date_assigned'     => ['required', 'date'],
            'assigned_by'       => ['sometimes', Rule::exists('users', 'id')],
            'remarks'           => ['nullable', 'string'],
            'selected_assets'   => ['required', 'array', 'min:1'],
            'selected_assets.*' => ['integer', Rule::exists('inventory_lists', 'id')],
        ]);

        DB::transaction(function () use ($assignment, $data, $request) {
            $assignment->update([
                'personnel_id'  => $data['personnel_id'],
                'date_assigned' => $data['date_assigned'],
                'remarks'       => $data['remarks'] ?? null,
                'assigned_by'   => $data['assigned_by'] ?? $assignment->assigned_by ?? $request->user()->id,
            ]);

            // Replace items + sync
            $assignment->items()->delete();
            foreach ($data['selected_assets'] as $assetId) {
                AssetAssignmentItem::create([
                    'asset_assignment_id' => $assignment->id,
                    'asset_id'            => $assetId,
                ]);

                InventoryList::where('id', $assetId)->update([
                    'assigned_to' => $assignment->personnel_id,
                ]);
            }
        });

        return redirect()->route('assignments.index')->with('success', "Assignment updated successfully.");
    }

    public function destroy(AssetAssignment $assignment)
    {
        DB::transaction(function () use ($assignment) {
            $assetIds = $assignment->items()->pluck('asset_id');

            if ($assetIds->isNotEmpty()) {
                InventoryList::whereIn('id', $assetIds)->update([
                    'assigned_to' => null,
                ]);
            }
            
            $assignment->items()->delete(); // Delete related items first

            $assignment->delete(); // Delete the assignment itself
        });

        return redirect()->route('assignments.index')->with('success', "Assignment deleted successfully, and assets were unassigned.");
    }

    public function show(Request $request, AssetAssignment $assignment)
    {
        $assignment->load([
            'personnel.unitOrDepartment',
            'assignedBy',
        ]);

        $items = AssetAssignmentItem::with([
            'asset.assetModel.category',
            'asset.unitOrDepartment',
            'asset.building',
            'asset.buildingRoom',
            'asset.subArea',
            'asset.transfer',
        ])
        ->where('asset_assignment_id', $assignment->id)
        ->paginate($request->input('per_page', 10));

        return Inertia::render('assignments/index', [
            ...$this->indexProps($request),
            'viewing' => $assignment,
            'viewing_items' => $items,
        ]);
    }

    public function showJson(Request $request, AssetAssignment $assignment)
    {
        $assignment->load([
            'personnel.unitOrDepartment',
            'assignedBy',
        ]);

        $items = AssetAssignmentItem::with([
            'asset.assetModel.category',
            'asset.unitOrDepartment',
            'asset.building',
            'asset.buildingRoom',
        ])
            ->where('asset_assignment_id', $assignment->id)
            ->paginate($request->input('per_page', 10));

        return response()->json([
            'assignment' => $assignment,
            'items' => $items,
        ]);
    }

    public function assignmentAssets(Request $request, AssetAssignment $assignment)
    {
        $items = AssetAssignmentItem::with([
            'asset' => function ($q) {
                $q->whereNull('deleted_at');
                $q->with([
                    'assetModel.category',
                    'unitOrDepartment',
                    'building',
                    'buildingRoom',
                    'subArea',
                ]);
            },
        ])
        ->where('asset_assignment_id', $assignment->id)
        ->whereHas('asset', function ($q) {
            $q->whereNull('deleted_at'); // double-check filter at query level
        })
        ->paginate($request->input('per_page', 10));

        return [
            'personnel_id' => $assignment->personnel_id,
            'items' => $items,
        ];
    }

    public function bulkReassignItems(Request $request, AssetAssignment $assignment)
    {
        $changes = $request->validate([
            'changes' => ['required', 'array'],
            'changes.*.item_id' => ['required', 'integer', Rule::exists('asset_assignment_items', 'id')],
            'changes.*.new_personnel_id' => ['nullable', 'integer', Rule::exists('personnels', 'id')],
        ])['changes'];

        foreach ($changes as $change) {
            $item = AssetAssignmentItem::where('id', $change['item_id'])
                ->where('asset_assignment_id', $assignment->id)
                ->first();

            if (!$item) continue;

            if (empty($change['new_personnel_id'])) {
                // Handle Unassignment
                $item->asset->update(['assigned_to' => null]);
                $item->delete(); // Soft-delete the assignment link
                continue;
            }

            // Handle reassignment
            $newAssignment = AssetAssignment::firstOrCreate(
                ['personnel_id' => $change['new_personnel_id']],
                [
                    'assigned_by'   => $request->user()->id,
                    'date_assigned' => now()->toDateString(),
                    'remarks'       => null,
                ]
            );

            $item->update(['asset_assignment_id' => $newAssignment->id]);
            $item->asset->update(['assigned_to' => $newAssignment->personnel_id]);
        }

        return back()->with('success', 'Assets reassigned successfully.');
    }

    public function bulkReassign(Request $request, AssetAssignment $assignment)
    {
        $data = $request->validate([
            'new_personnel_id' => ['required', Rule::exists('personnels', 'id')],
        ]);

        DB::transaction(function () use ($assignment, $data, $request) {
            $newAssignment = AssetAssignment::firstOrCreate(
                ['personnel_id' => $data['new_personnel_id']],
                [
                    'assigned_by'   => $request->user()->id,
                    'date_assigned' => now()->toDateString(),
                    'remarks'       => null,
                ]
            );

            $assetIds = AssetAssignmentItem::where('asset_assignment_id', $assignment->id)
                ->pluck('asset_id');

            AssetAssignmentItem::where('asset_assignment_id', $assignment->id)
                ->update(['asset_assignment_id' => $newAssignment->id]);

            // Sync assigned_to for all affected assets
            InventoryList::whereIn('id', $assetIds)->update([
                'assigned_to' => $newAssignment->personnel_id,
            ]);
        });

        return back()->with('success', 'All assets reassigned successfully.');
    }

    public function unassignItem(Request $request, AssetAssignmentItem $item)
    {
        DB::transaction(function () use ($item) {
            $assetId = $item->asset_id; // Nullify assigned_to in inventory_lists
            InventoryList::where('id', $assetId)->update([
                'assigned_to' => null,
            ]);

            $item->delete();
        });

        return response()->json(['success' => true]);
    }
}
