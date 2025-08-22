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
        $this->authorize('viewInbox', FormApproval::class);

        $tab    = $request->string('tab', 'pending')->toString(); // pending|approved|rejected
        $search = $request->string('q')->toString();

        $base = FormApproval::with(['requestedBy','reviewedBy','approvable'])
            ->when($tab === 'pending',  fn($q) => $q->pending())
            ->when($tab === 'approved', fn($q) => $q->approved())
            ->when($tab === 'rejected', fn($q) => $q->rejected())
            ->quickSearch($search)
            ->latest('requested_at');

        $approvals = $base->paginate(10)->withQueryString();

        return Inertia::render('approvals/index', [
            'tab'       => $tab,
            'q'         => $search,
            'approvals' => $approvals,
        ]);
    }

    public function approve(FormApproval $approval, Request $request)
    {
        $this->authorize('review', $approval);

        $approval->update([
            'status'       => ApprovalStatus::APPROVED->value,
            'review_notes' => $request->string('notes')->toString() ?: null,
            'reviewed_by_id' => $request->user()->id,
            'reviewed_at'  => now(),
        ]);

        // Optionally: also flip the underlying record’s own status if you keep one
        // $approval->approvable->update(['status' => ApprovalStatus::APPROVED->value]);

        return back()->with('success', 'Form approved.');
    }

    public function reject(FormApproval $approval, Request $request)
    {
        $this->authorize('review', $approval);

        $request->validate(['notes' => ['nullable','string','max:1000']]);

        $approval->update([
            'status'         => ApprovalStatus::REJECTED->value,
            'review_notes'   => $request->string('notes')->toString() ?: null,
            'reviewed_by_id' => $request->user()->id,
            'reviewed_at'    => now(),
        ]);

        // Optionally: also flip the underlying record’s own status
        // $approval->approvable->update(['status' => ApprovalStatus::REJECTED->value]);

        return back()->with('success', 'Form rejected.');
    }
}
