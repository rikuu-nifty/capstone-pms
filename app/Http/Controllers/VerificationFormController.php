<?php

namespace App\Http\Controllers;

use App\Models\VerificationForm;
use App\Models\TurnoverDisposal;
use App\Models\User;

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

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

        $turnover = $verification->turnoverDisposal;
        $turnover->notes = $verification->notes;
        $turnover->verified_at = $verification->verified_at;
        $turnover->status = $verification->status;

        $pmoHead = User::whereHas('role', fn($q) => $q->where('code', 'pmo_head'))
            ->whereNull('deleted_at')
            ->select('id', 'name')
            ->first();

        return Inertia::render('verification-form/index', [
            'turnovers' => VerificationForm::fetchPaginated(),
            'totals'    => VerificationForm::summaryTotals(),
            'viewing'   => $verification->turnoverDisposal,
            'verification'  => [
                'id'          => $verification->id,
                'status'      => $verification->status,
                'notes'       => $verification->notes,
                'remarks'     => $verification->remarks,
                'verified_at' => $verification->verified_at,
                'verified_by' => $verification->verifiedBy?->only(['id', 'name']),
            ],
            'pmo_head' => $pmoHead ? $pmoHead->only(['id', 'name']) : null,
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
            'remarks' => $request->input('remarks'),
        ]);

        return back()->with('success', "Verification Form #{$verification->id} verified successfully.");
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
            'remarks' => 'nullable|string|max:2000',
        ]);

        $verification = VerificationForm::findOrFail($id);

        $verification->update([
            'status' => 'rejected',
            'verified_by_id' => Auth::id(),
            'verified_at' => now(),
            'notes' => $request->input('notes'),
            'remarks' => $request->input('remarks'),
        ]);

        return back()->with('success', "Verification Form #{$verification->id} has been rejected.");
    }

    public function exportPdf($id)
    {
        $verification = VerificationForm::with([
            'turnoverDisposal.issuingOffice',
            'turnoverDisposal.turnoverDisposalAssets.assets.assetModel',
        ])->findOrFail($id);

        $turnover = $verification->turnoverDisposal;

        $pmoHead = User::whereHas('role', fn($q) => $q->where('code', 'pmo_head'))
            ->whereNull('deleted_at')
            ->select('id', 'name')
            ->first();

        $pdf = Pdf::loadView('forms.verification-form', [
            'turnover' => $turnover,
            'pmo_head' => $pmoHead,
            'verification' => $verification,
        ])
        ->setPaper('A4', 'portrait');

        return $pdf->stream("Verification_Form_{$verification->id}.pdf");
    }
}
