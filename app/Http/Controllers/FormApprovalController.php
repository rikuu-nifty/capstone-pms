<?php
namespace App\Http\Controllers;

use App\Enums\ApprovalStatus;
use App\Models\FormApproval;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\OffCampusSignatory;

// 🔹 Import the event
use App\Events\FormApproved;

class FormApprovalController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $user = $request->user();
        $roleCode = $user?->role?->code;

        $tab    = $request->string('tab', 'pending')->toString();
        $search = $request->string('q')->toString();

        $actorMap = [
            'inventory_scheduling:noted_by'    => ['name' => 'PMO Head', 'code' => 'pmo_head'],
            'inventory_scheduling:approved_by' => ['name' => 'VP Admin', 'code' => 'vp_admin'],
            'off_campus:issued_by'             => ['name' => 'PMO Head', 'code' => 'pmo_head'],
            'off_campus:external_approved_by'  => ['name' => 'Dean/Head', 'code' => 'external'],
            'transfer:approved_by'             => ['name' => 'PMO Head', 'code' => 'pmo_head'],
            'turnover_disposal:noted_by'       => ['name' => 'PMO Head', 'code' => 'pmo_head'],
            'turnover_disposal:external_noted_by' => ['name' => 'Dean/Head', 'code' => 'external'],
        ];

        $approvals = FormApproval::with([
            'requestedBy:id,name',
            'reviewedBy:id,name',
            'approvable',
            'steps' => fn ($q) => $q->where('status', 'pending')->orderBy('step_order'),
        ])
        ->when($tab === 'pending',  fn ($q) => $q->where('status', 'pending_review'))
        ->when($tab === 'approved', fn ($q) => $q->where('status', 'approved'))
        ->when($tab === 'rejected', fn ($q) => $q->where('status', 'rejected'))
        ->quickSearch($search)
        ->orderByDesc('requested_at')
        ->orderByDesc('id')
        ->paginate(10)
        ->withQueryString()
        ->through(function (FormApproval $a) use ($actorMap, $roleCode) {
            $step = $a->steps->first();

            $key   = $a->form_type . ':' . ($step?->code ?? '');
            $actor = $actorMap[$key] ?? null;

            $a->setAttribute('current_step_label', $step?->label);
            $a->setAttribute('current_step_is_external', (bool) ($step?->is_external));
            $a->setAttribute('current_step_code', $step?->code);
            $a->setAttribute('current_step_actor',       $actor['name'] ?? null);
            $a->setAttribute('current_step_actor_code',  $actor['code'] ?? null);

            $pending    = $a->status === 'pending_review';
            $isExternal = (bool) ($step?->is_external) || (($actor['code'] ?? null) === 'external');

            $canInternal = $pending && !$isExternal
                && $roleCode !== null
                && $actor && ($roleCode === ($actor['code'] ?? null) || $roleCode === 'superuser');

            $canExternal = $pending && $isExternal
                && in_array($roleCode, ['superuser', 'vp_admin', 'pmo_head'], true);

            $a->setAttribute('can_approve', $canInternal || $canExternal ? 1 : 0);
            $a->setAttribute('can_reject',  $canInternal || $canExternal ? 1 : 0);
            $a->setAttribute('can_reset',   $a->status !== 'pending_review'
                && in_array($roleCode, ['superuser', 'vp_admin'], true) ? 1 : 0
            );
                $a->unsetRelation('steps');

                return $a;
            });

        return Inertia::render('approvals/index', [
            'tab'       => $tab,
            'q'         => $search,
            'approvals' => $approvals,
        ]);
    }


    public function approve(FormApproval $approval, Request $request)
{
    $this->authorize('review', $approval);

    // Approve the current step
    $approval->approveCurrentStep($request->string('notes')->toString() ?: null);

    // ✅ If this is the PMO Head approving "Issued By", update the signatories table
    if ($approval->approvable_type === \App\Models\OffCampus::class 
        && $approval->currentStep?->code === 'issued_by' 
        && $approval->currentStep->status === \App\Enums\ApprovalStatus::APPROVED) 
    {
        $actor = $request->user();

        \App\Models\OffCampusSignatory::updateOrCreate(
            ['role_key' => 'issued_by'],
            [
                'name'  => $actor->name,
                'title' => $actor->role->title ?? 'Head, PMO',
            ]
        );
    }

    // If the form is fully approved, update parent status
    if ($approval->isFullyApproved()) {
        $approval->updateParentFormStatus();
    }

    // Dispatch audit trail event
    if ($approval->currentStep) {
        \App\Events\FormApproved::dispatch($approval->currentStep, 'approved');
    }

    return back()->with('success', 'Step approved.');
}


    public function reject(FormApproval $approval, Request $request)
    {
        $this->authorize('review', $approval);

        $approval->rejectCurrentStep($request->string('notes')->toString() ?: null);

        $approval->updateParentFormStatus('rejected');

        // 🔹 Dispatch event for audit trail (guard against null)
        if ($approval->currentStep) {
            FormApproved::dispatch($approval->currentStep, 'rejected');
        }

        return back()->with('success', 'Step rejected.');
    }

    public function externalApprove(FormApproval $approval, Request $request)
    {
        $data = $request->validate([
            'external_name'  => ['required','string','max:255'],
            'external_title' => ['nullable','string','max:255'],
            'notes'          => ['nullable','string','max:1000'],
        ]);

        $approval->externalApproveCurrentStep(
            $data['external_name'], 
            $data['external_title'] ?? null, 
            $data['notes'] ?? null)
        ;

        if ($approval->isFullyApproved()) {
            $approval->updateParentFormStatus();
        }

        // 🔹 Dispatch event for audit trail (guard against null)
        if ($approval->currentStep) {
            FormApproved::dispatch($approval->currentStep, 'approved'); // external approvals count as approved
        }

        return back()->with('success', 'External approval recorded.');
    }

  public function reset(FormApproval $approval, Request $request)
{
    $this->authorize('review', $approval);

    // Reset back to Pending
    $approval->resetToPending();

    // ✅ Clear Dean/Head approval values ONLY for Off-Campus
    if ($approval->approvable_type === \App\Models\OffCampus::class) {
        $approval->approvable->update([
            'approved_by' => null, // reset dean/concerned field
        ]);
    }

    return back()->with('success', 'Moved back to Pending Review.');
}
}
