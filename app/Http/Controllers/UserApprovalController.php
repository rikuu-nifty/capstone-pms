<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use App\Notifications\RequestEmailChangeNotification;
use App\Notifications\PasswordResetNotification;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserApprovalController extends Controller
{
    use AuthorizesRequests, SoftDeletes;

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
                'filterRole' => $request->integer('filter_role') ?: '',
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

        $user->reassignRoleWithNotify($role, $request->input('notes'));

        return back()->with('status', "Reassigned role for {$user->email}");
    }

    public function destroy(User $user)
    {
        $this->authorize('delete-users', $user);
        $user->delete();

        return back()->with('status', "Deleted {$user->email}");
    }

    public function requestEmailChange(User $user)
    {
        $user->notify(new RequestEmailChangeNotification());

        return back()->with('status', "Email change request sent to {$user->email}");
    }
}
