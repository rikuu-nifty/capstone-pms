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
        ->latest('requested_at')
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
            // $a->setAttribute('current_step_actor', 
            //     match ($a->form_type . ':' . ($step?->code ?? '')) {
            //         'inventory_scheduling:noted_by'     => 'PMO Head',
            //         'inventory_scheduling:approved_by'  => 'VP Admin',
            //         'off_campus:issued_by'              => 'PMO Head',
            //         'off_campus:external_approved_by'   => 'Dean/Head',
            //         'transfer:approved_by'              => 'PMO Head',
            //         'turnover_disposal:noted_by'        => 'PMO Head',
            //         default                              => null,
            //     });
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

        $approval->approveCurrentStep($request->string('notes')->toString() ?: null);

        if ($approval->isFullyApproved()) {
            $approval->updateParentFormStatus();
        }

        return back()->with('success', 'Step approved.');
    }

    public function reject(FormApproval $approval, Request $request)
    {
        $this->authorize('review', $approval);

        $approval->rejectCurrentStep($request->string('notes')->toString() ?: null);

        $approval->updateParentFormStatus('rejected');

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
