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
        $filter = $request->string('filter')->toString() ?: 'pending';

        if ($tab === 'system') {
            // dd(
            //     Auth::user()?->id,
            //     Auth::user()?->email,
            //     Auth::user()?->status,
            //     Auth::user()?->role?->code
            // );

            // dd('[' . Auth::user()->role->code . ']');


            // $this->authorize('view-users-page');

            $users = User::with([
                    'detail:id,user_id,first_name,last_name', 
                    'role:id,name,code'
                ])
                ->approved()
                ->paginate(10)
            ;

            return Inertia::render('users/index', [
                'tab' => 'system',
                'users' => $users,
            ]);
        }

        if ($tab === 'approvals') {

            // $this->authorize('view-users-page');

            $users = User::fetchForApprovals($filter);

            return Inertia::render('users/index', [
                'tab' => 'approvals',
                'filter' => $filter,
                'users' => $users,
            ]);
        }

        // abort(404);
    }

    public function approve(User $user, Request $request)
    {
        $roleId = $request->input('role_id');
        $role   = Role::findOrFail($roleId);

        $this->authorize('assign-role', $role->code);

        $user->approveWithRoleAndNotify($role, $request->input('notes'));

        return back()->with('status', "Approved {$user->email}");
    }

    public function reject(User $user, Request $request)
    {
        $user->rejectWithNotes($request->input('notes'));

        return back()->with('status', "Denied {$user->email}");
    }

    // public function destroy(User $user)
    // {
    //     $this->authorize('view-users-page');
    //     $user->delete();

    //     return back()->with('status', "Deleted {$user->email}");
    // }
}
