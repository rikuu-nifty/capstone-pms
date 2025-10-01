<?php

namespace App\Http\Controllers;

use App\Models\TransferSignatory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransferSignatoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $signatories = TransferSignatory::all()->keyBy('role_key');

        return Inertia::render('transfer-signatories/index', [
            'signatories' => $signatories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'role_key' => 'required|string|unique:transfer_signatories,role_key',
            'name'     => 'required|string|max:255',
            'title'    => 'required|string|max:255',
        ]);

        TransferSignatory::create($data);

        return redirect()->back()->with('success', 'Transfer signatory added successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TransferSignatory $signatory)
    {
        $data = $request->validate([
            'role_key' => 'required|string|unique:transfer_signatories,role_key,' . $signatory->id,
            'name'     => 'required|string|max:255',
            'title'    => 'required|string|max:255',
        ]);

        $signatory->update($data);

        return redirect()->back()->with('success', 'Transfer signatory updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TransferSignatory $signatory)
    {
        $signatory->delete();

        return redirect()->back()->with('success', 'Transfer signatory deleted successfully.');
    }
}
