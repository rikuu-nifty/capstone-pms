<?php

namespace App\Http\Controllers;

use App\Models\AssetAssignment;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AssetAssignmentController extends Controller
{
    private function indexProps(Request $request): array
    {
        $perPage = $request->input('per_page', 10);

        return [
            'assignments' => AssetAssignment::listForIndex($perPage),
            'totals'      => AssetAssignment::totals(),
        ];
    }

    public function index(Request $request)
    {
        return Inertia::render('assignments/index', $this->indexProps($request));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'personnel_id'          => ['required', Rule::exists('personnels', 'id')],
            'unit_or_department_id' => ['required', Rule::exists('unit_or_departments', 'id')],
            'assigned_by'           => ['nullable', Rule::exists('users', 'id')],
            'date_assigned'         => ['required', 'date'],
            'remarks'               => ['nullable', 'string'],
            'selected_assets'       => ['required', 'array', 'min:1'],
            'selected_assets.*'     => ['integer', Rule::exists('inventory_lists', 'id')],
        ]);

        DB::transaction(function () use ($data) {
            foreach ($data['selected_assets'] as $assetId) {
                AssetAssignment::create([
                    'asset_id'              => $assetId,
                    'personnel_id'          => $data['personnel_id'],
                    'unit_or_department_id' => $data['unit_or_department_id'],
                    'assigned_by'           => $data['assigned_by'] ?? null,
                    'date_assigned'         => $data['date_assigned'],
                    'remarks'               => $data['remarks'] ?? null,
                ]);
            }
        });

        return redirect()->route('assignments.index')->with('success', "Asset(s) assigned successfully.");
    }

    public function update(Request $request, AssetAssignment $assignment)
    {
        $data = $request->validate([
            'personnel_id'          => ['required', Rule::exists('personnels', 'id')],
            'unit_or_department_id' => ['required', Rule::exists('unit_or_departments', 'id')],
            'date_assigned'         => ['required', 'date'],
            'remarks'               => ['nullable', 'string'],
            'selected_assets'       => ['required', 'array', 'min:1'],
            'selected_assets.*'     => ['integer', Rule::exists('inventory_lists', 'id')],
        ]);

        DB::transaction(function () use ($assignment, $data) {
            // Delete the "current" one (or group) and replace with new selection
            $assignment->delete();

            foreach ($data['selected_assets'] as $assetId) {
                AssetAssignment::create([
                    'asset_id'              => $assetId,
                    'personnel_id'          => $data['personnel_id'],
                    'unit_or_department_id' => $data['unit_or_department_id'],
                    'assigned_by'           => $assignment->assigned_by, // keep original assigner
                    'date_assigned'         => $data['date_assigned'],
                    'remarks'               => $data['remarks'] ?? null,
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
