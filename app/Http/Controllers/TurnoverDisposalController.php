<?php

namespace App\Http\Controllers;
use Inertia\Inertia;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

use App\Models\InventoryList;
use App\Models\TurnoverDisposal;
use App\Models\UnitOrDepartment;
use App\Models\TurnoverDisposalAsset;

class TurnoverDisposalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $assignedBy = Auth::user();

        $unitOrDepartments = UnitOrDepartment::all();

        $turnoverDisposals = TurnoverDisposal::with([
            'turnoverDisposalAssets',
            'issuingOffice',
            'receivingOffice',
        ])
            ->withCount('turnoverDisposalAssets as asset_count')
            ->latest()
            ->get()
        ;

        $turnoverDisposalAssets = TurnoverDisposalAsset::with([
            'assets.assetModel.category',
        ])
        ->whereHas('turnoverDisposal', function ($query) {
            $query->where('status', '!=', 'disposed');
        })
        ->get();

        $assets = InventoryList::with(['assetModel.category'])
            ->get();


        return Inertia::render('turnover-disposal/index', [
            'turnoverDisposals' => $turnoverDisposals,
            'turnoverDisposalAssets' => $turnoverDisposalAssets,
            'assets' => $assets,
            'unitOrDepartments' => $unitOrDepartments,
            'assignedBy' => $assignedBy,         
        ]);

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'issuing_office_id' => ['required', 'integer', Rule::exists('unit_or_departments', 'id')],
            'type' => ['required', Rule::in(['turnover', 'disposal'])],
            'receiving_office_id' => ['required', 'integer', Rule::exists('unit_or_departments', 'id')],
            'description' => ['nullable', 'string'],
            'personnel_in_charge_id' => ['nullable', 'string'],
            'document_date' => ['required', 'date'],
            'status' => [
                'required', 
                Rule::in(['pending_review', 'approved', 'rejected', 'cancelled', 'cancelled'])
            ],
            'remarks' => ['nullable', 'string'],
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
