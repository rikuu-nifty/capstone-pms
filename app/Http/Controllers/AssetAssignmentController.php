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
            'assigned_by'       => ['nullable', Rule::exists('users', 'id')],
            'date_assigned'     => ['required', 'date'],
            'remarks'           => ['nullable', 'string'],
            'selected_assets'   => ['required', 'array', 'min:1'],
            'selected_assets.*' => ['integer', Rule::exists('inventory_lists', 'id')],
        ]);

        DB::transaction(function () use ($data) {
            $assignment = AssetAssignment::create([
                'personnel_id'  => $data['personnel_id'],
                'assigned_by'   => $data['assigned_by'] ?? null,
                'date_assigned' => $data['date_assigned'],
                'remarks'       => $data['remarks'] ?? null,
            ]);

            foreach ($data['selected_assets'] as $assetId) {
                AssetAssignmentItem::create([
                    'asset_assignment_id' => $assignment->id,
                    'asset_id'            => $assetId,
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
            'remarks'           => ['nullable', 'string'],
            'selected_assets'   => ['required', 'array', 'min:1'],
            'selected_assets.*' => ['integer', Rule::exists('inventory_lists', 'id')],
        ]);

        DB::transaction(function () use ($assignment, $data) {
            $assignment->update([
                'personnel_id'  => $data['personnel_id'],
                'date_assigned' => $data['date_assigned'],
                'remarks'       => $data['remarks'] ?? null,
            ]);

            // Replace items
            $assignment->items()->delete();
            foreach ($data['selected_assets'] as $assetId) {
                AssetAssignmentItem::create([
                    'asset_assignment_id' => $assignment->id,
                    'asset_id'            => $assetId,
                ]);
            }
        });

        return redirect()->route('assignments.index')->with('success', "Assignment updated successfully.");
    }

    public function destroy(AssetAssignment $assignment)
    {
        DB::transaction(fn() => $assignment->delete());

        return redirect()->route('assignments.index')->with('success', "Assignment deleted successfully.");
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }
    
    /**
     * Display the specified resource.
     */
    public function show(AssetAssignment $assetAssignment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AssetAssignment $assetAssignment)
    {
        //
    }
    
}
