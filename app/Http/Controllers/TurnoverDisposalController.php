<?php

namespace App\Http\Controllers;
use Inertia\Inertia;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Models\User;
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
        $issuedBy = Auth::user();

        $turnoverDisposals = TurnoverDisposal::with([
            'turnoverDisposalAssets',
            'issuedBy',
        ])
        ->latest()
        ->get();

        $unitOrDepartments = UnitOrDepartment::all();
        $turnoverDisposalAssets = TurnoverDisposalAsset::with([
            'assets.assetModel.category'
        ])
        ->whereHas('turnoverDisposal', function ($query) {
            $query->where('status', '!=', 'disposed');
        })
        ->get();

        $asset_count = $turnoverDisposalAssets->count();

        return Inertia::render('turnover-disposal/index', [
            'turnoverDisposals' => $turnoverDisposals,
            'turnoverDisposalAssets' => $turnoverDisposalAssets,            
            'issuedBy' => $issuedBy,
            'unitOrDepartments' => $unitOrDepartments,
            'asset_count' => $asset_count,
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
