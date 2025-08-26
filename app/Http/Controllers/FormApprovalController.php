<?php
namespace App\Http\Controllers;

use App\Enums\ApprovalStatus;
use App\Models\FormApproval;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FormApprovalController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $tab    = $request->string('tab', 'pending')->toString();
        $search = $request->string('q')->toString();

        $base = FormApproval::with([
                'requestedBy:id,name',
                'reviewedBy:id,name',
                'approvable',
                'steps' => fn($q) => $q->where('status','pending')->orderBy('step_order'),
            ])
            ->when($tab === 'pending',  fn($q) => $q->where('status','pending_review'))
            ->when($tab === 'approved', fn($q) => $q->where('status','approved'))
            ->when($tab === 'rejected', fn($q) => $q->where('status','rejected'))
            ->quickSearch($search)
            ->latest('requested_at');

        // Option A: using through()
        $approvals = $base->paginate(10)->withQueryString()
            ->through(function ($a) {
                $step = $a->steps->first();
                $a->setAttribute('current_step_label', $step?->label);
                $a->setAttribute('current_step_is_external', (bool) ($step?->is_external));
                $a->unsetRelation('steps'); // or setRelation('steps', collect())
                return $a;
            });

        // Option B (what you already have) — keep it if you prefer:
        // $approvals = $base->paginate(10)->withQueryString();
        // $approvals->getCollection()->transform(function ($a) {
        //     $step = $a->steps->first();
        //     $a->setAttribute('current_step_label', $step?->label);
        //     $a->setAttribute('current_step_is_external', (bool) ($step?->is_external));
        //     $a->unsetRelation('steps');
        //     return $a;
        // });

        return Inertia::render('approvals/index', [
            'tab'       => $tab,
            'q'         => $search,
            'approvals' => $approvals,
        ]);
}


    public function approve(FormApproval $approval, Request $request)
    {
        $this->authorize('review', $approval);

        $approval->approveCurrentStep($request->string('notes')->toString() ?: null);

        // Optionally: also flip the underlying record’s own status if you keep one
        // $approval->approvable->update(['status' => ApprovalStatus::APPROVED->value]);

        return back()->with('success', 'Step approved.');
    }

    public function reject(FormApproval $approval, Request $request)
    {
        $this->authorize('review', $approval);

        $approval->rejectCurrentStep($request->string('notes')->toString() ?: null);

        // Optionally: also flip the underlying record’s own status
        // $approval->approvable->update(['status' => ApprovalStatus::REJECTED->value]);

        return back()->with('success', 'Step rejected.');
    }

    public function externalApprove(FormApproval $approval, Request $request)
    {
        $data = $request->validate([
            'external_name'  => ['required','string','max:255'],
            'external_title' => ['nullable','string','max:255'],
            'notes'          => ['nullable','string','max:1000'],
        ]);
        $approval->externalApproveCurrentStep($data['external_name'], $data['external_title'] ?? null, $data['notes'] ?? null);
        return back()->with('success', 'External approval recorded.');
    }

    public function reset(FormApproval $approval, Request $request)
    {
        $this->authorize('review', $approval);

        // If it’s already pending, do nothing (idempotent)
         $approval->resetToPending();

        return back()->with('success', 'Moved back to Pending Review.');
    }
}
