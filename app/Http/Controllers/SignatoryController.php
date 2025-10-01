<?php

namespace App\Http\Controllers;

use App\Models\InventorySchedulingSignatory;
use App\Models\TransferSignatory; // ✅ new import
use Illuminate\Http\Request;
use Inertia\Inertia;

class SignatoryController extends Controller
{
    /**
     * Display a listing of signatories filtered by module_type.
     */
    public function index(Request $request)
    {
        $moduleType = $request->input('module_type', 'inventory_scheduling');

        // ✅ Decide which table to query
        if ($moduleType === 'property_transfer') {
            $signatories = TransferSignatory::all()->keyBy('role_key');
        } else {
            $signatories = InventorySchedulingSignatory::forModule($moduleType)->get()->keyBy('role_key');
        }

        return Inertia::render('signatories/index', [
            'signatories' => $signatories,
            'moduleType'  => $moduleType,
        ]);
    }

    /**
     * Store a newly created signatory.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'module_type' => 'required|string',
            'role_key'    => 'required|string',
            'name'        => 'required|string|max:255',
            'title'       => 'required|string|max:255',
        ]);

        // ✅ Insert into correct table
        if ($data['module_type'] === 'property_transfer') {
            TransferSignatory::create($data);
        } else {
            InventorySchedulingSignatory::create($data);
        }

        return redirect()->back()->with('success', 'Signatory added successfully.');
    }

    /**
     * Update the specified signatory.
     */
    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'module_type' => 'required|string',
            'role_key'    => 'required|string',
            'name'        => 'required|string|max:255',
            'title'       => 'required|string|max:255',
        ]);

        // ✅ Update in correct table
        if ($data['module_type'] === 'property_transfer') {
            $signatory = TransferSignatory::findOrFail($id);
            $signatory->update($data);
        } else {
            $signatory = InventorySchedulingSignatory::findOrFail($id);
            $signatory->update($data);
        }

        return redirect()->back()->with('success', 'Signatory updated successfully.');
    }

    /**
     * Remove the specified signatory.
     */
    public function destroy(Request $request, $id)
    {
        $moduleType = $request->input('module_type', 'inventory_scheduling');

        // ✅ Delete from correct table
        if ($moduleType === 'property_transfer') {
            $signatory = TransferSignatory::findOrFail($id);
        } else {
            $signatory = InventorySchedulingSignatory::findOrFail($id);
        }

        $signatory->delete();

        return redirect()->back()->with('success', 'Signatory deleted successfully.');
    }
}
