<?php

namespace App\Http\Controllers;

use App\Models\TurnoverDisposal;
use Inertia\Inertia;

class VerificationFormController extends Controller
{
    public function index()
    {
        // 🔹 Fetch all approved/completed forms
        $turnovers = TurnoverDisposal::with([
            'issuingOffice:id,name,code',
            'receivingOffice:id,name,code',
            'formApproval.steps.actor:id,name',
        ])
            // ->whereIn('status', ['approved', 'completed'])
            ->latest('document_date')
            ->paginate(20);

        // 🔹 Render the list page (index)
        return Inertia::render('verification-form/index', [
            'turnovers' => $turnovers,
        ]);
    }

    public function show($id)
    {
        // 🔹 Fetch a single verification form with all relations
        $turnover = TurnoverDisposal::with([
            'issuingOffice',
            'receivingOffice',
            'personnel',
            'turnoverDisposalAssets.assets.assetModel.category',
            'turnoverDisposalAssets.assets.building',
            'turnoverDisposalAssets.assets.buildingRoom',
            'turnoverDisposalAssets.assets.subArea',
            'formApproval.steps.actor',
        ])->findOrFail($id);

        // 🔹 Render the detailed view page
        return Inertia::render('verification-form/ViewVerificationForm', [
            'turnover' => $turnover,
        ]);
    }
}
