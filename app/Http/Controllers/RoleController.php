<?php

namespace App\Http\Controllers;
// use App\Http\Requests\InventoryListAddNewAssetFormRequest;

use App\Events\RoleChanged;
use Inertia\Inertia;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class RoleController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $q = $request->string('q')->toString();

        return Inertia::render('roles/index', [
            'roles' => Role::fetchRoles($q),
            'permissions' => Role::fetchAllPermissions(),
            'totals' => Role::fetchTotals(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('manage-roles');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'code' => ['required', 'string', 'max:255', 'unique:roles,code'],
            'description' => ['nullable', 'string'],
        ]);

        $role = Role::createRole($validated);

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        return redirect()->route('role-management.index')->with('success', 'Role created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', "unique:roles,name,{$role->id}"],
            'code' => ['required', 'string', 'max:255', "unique:roles,code,{$role->id}"],
            'description' => ['nullable', 'string'],
            'permissions' => ['array'],
        ]);

        // Capture old values before update
        $oldRole = $role->name;

        Role::updateRole($role, $validated);

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        // 🔹 No RoleChanged event here — handled by RoleObserver for model updates
        $newRole = $role->name;

        return redirect()->route('role-management.index')->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        $resp = Gate::inspect('delete-role', $role);
        if ($resp->denied()) {
            return back(303)->with('unauthorized', $resp->message() ?: 'Not authorized.');
        }

        $role->delete();

        return redirect()
            ->route('role-management.index')
            ->with('success', 'Role deleted successfully.');
    }
        
    public function updatePermissions(Request $request, Role $role)
    {
        $this->authorize('update-permissions');

        $request->validate(['permissions' => 'array']);
        $role->permissions()->sync($request->permissions ?? []);

        return redirect()->route('role-management.index')
            ->with('success', 'Permissions updated successfully.');
    }

    /**
     * 🔹 Assign a role to a specific user and dispatch RoleChanged event
     */
    public function assignRoleToUser(Request $request, User $user)
    {
        $this->authorize('manage-roles');

        $request->validate([
            'role_id' => ['required', 'exists:roles,id'],
        ]);

        $oldRole = $user->role?->name;

        $user->role_id = $request->role_id;
        $user->save();

        $newRole = $user->role?->name;

        // Dispatch RoleChanged event (user’s role assignment updated)
        RoleChanged::dispatch($user, $oldRole, $newRole);

        return redirect()->route('role-management.index')
            ->with('success', 'User role updated successfully and logged in audit trail.');
    }
}
