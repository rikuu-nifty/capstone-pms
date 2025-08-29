<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Notifications\UserApprovedNotification;
use App\Notifications\UserDeniedNotification;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;

use App\Models\User;
use App\Models\Role;

class UserApprovalController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $tab = $request->string('tab')->toString() ?: 'system';
        $filter = $request->string('filter')->toString();
        $q = $request->string('q')->toString();

        if ($tab === 'system') {
            return Inertia::render('users/index', [
                'tab'    => 'system',
                'users'  => User::fetchSystemUsers($q),
                'totals' => User::fetchTotals(),
                'roles'  => Role::all(['id', 'name', 'code']),
            ]);
        }

        if ($tab === 'approvals') {
            return Inertia::render('users/index', [
                'tab'    => 'approvals',
                'filter' => $filter,
                'users'  => User::fetchApprovals($filter, $q),
                'totals' => User::fetchTotals(),
                'roles'  => Role::all(['id', 'name', 'code']),
            ]);
        }

        abort(404);
    }

    public function approve(User $user, Request $request)
    {
        $roleId = $request->input('role_id');
        $role   = Role::findOrFail($roleId);

        $this->authorize('assign-role', $role->code);

        $user->approveWithRoleAndNotify($role, $request->input('notes'));

        return back()->with('status', "Approved {$user->email}");
    }

    public function deny(User $user, Request $request)
    {
        $user->rejectWithNotes($request->input('notes'));

        return back()->with('status', "Denied {$user->email}");
    }

    public function reassignRole(User $user, Request $request)
    {
        $request->validate(['role_id' => 'required|exists:roles,id']);
        $role = Role::findOrFail($request->role_id);
        // $this->authorize('reassign-role', $role->code);

        $user->reassignRoleWithNotify($role, $request->input('notes'));

        return back()->with('status', "Reassigned role for {$user->email}");
    }


    // public function destroy(User $user)
    // {
    //     $this->authorize('view-users-page');
    //     $user->delete();

    //     return back()->with('status', "Deleted {$user->email}");
    // }
}
