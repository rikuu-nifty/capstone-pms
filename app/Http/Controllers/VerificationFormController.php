<?php

namespace App\Http\Controllers;

use App\Models\VerificationForm;
use App\Models\TurnoverDisposal;

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class VerificationFormController extends Controller
{
    public function index()
    {
        return Inertia::render('verification-form/index', [
            'turnovers' => VerificationForm::fetchPaginated(),
            'totals'    => VerificationForm::summaryTotals(),
        ]);
    }

    public function show($id)
    {
        $verification = VerificationForm::with([
            'turnoverDisposal.issuingOffice',
            'turnoverDisposal.receivingOffice',
            'turnoverDisposal.personnel',
            'turnoverDisposal.turnoverDisposalAssets.assets.assetModel.category',
            'turnoverDisposal.turnoverDisposalAssets.assets.building',
            'turnoverDisposal.turnoverDisposalAssets.assets.buildingRoom',
            'turnoverDisposal.turnoverDisposalAssets.assets.subArea',
            'turnoverDisposal.formApproval.steps.actor',
        ])->findOrFail($id);

        return Inertia::render('verification-form/index', [
            'turnovers' => VerificationForm::fetchPaginated(),
            'totals'    => VerificationForm::summaryTotals(),
            'viewing'   => $verification->turnoverDisposal,
        ]);
    }

    public function verify(Request $request, $id)
    {
        $verification = VerificationForm::findOrFail($id);

        $verification->update([
            'status' => 'verified',
            'verified_by_id' => Auth::id(),
            'verified_at' => now(),
            'notes' => $request->input('notes'),
        ]);

        return back()->with('success', "Verification Form #{$verification->id} verified successfully.");
    }

    public function reject($id)
    {
        $verification = VerificationForm::findOrFail($id);

        $verification->update([
            'status' => 'rejected',
            'verified_by_id' => Auth::id(),
            'verified_at' => now(),
        ]);

        return back()->with('success', "Verification Form #{$verification->id} has been rejected.");
    }
}
