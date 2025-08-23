<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Notifications\UserApprovedNotification;
use App\Notifications\UserDeniedNotification;

class UserApprovalController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->query('tab','all');

        $q = User::query();
        if ($tab === 'approved') $q->approved();
        elseif ($tab === 'pending') $q->pending();
        elseif ($tab === 'denied') $q->denied();

        $users = $q->latest()->paginate(10)->withQueryString();

        return Inertia::render('approvals/users/index', [
            'users' => $users,
            'tab' => $tab,
        ]);
    }

    public function approve(User $user, Request $request)
    {
        if ($user->status !== 'approved') {
            $user->update([
                'status'         => 'approved',
                'approved_at'    => now(),
                'approval_notes' => $request->input('notes'),
            ]);

            $user->notify(new UserApprovedNotification($request->input('notes')));
        }

        return back()->with('status', "Approved {$user->email}");
    }

    public function deny(User $user, Request $request)
    {
        if ($user->status !== 'denied') {
            $user->update([
                'status'         => 'denied',
                'approved_at'    => null,
                'approval_notes' => $request->input('notes'),
            ]);

            $user->notify(new UserDeniedNotification($request->input('notes')));
        }

        return back()->with('status', "Denied {$user->email}");
    }
}
