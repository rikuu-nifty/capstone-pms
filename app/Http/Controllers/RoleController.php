<?php

namespace App\Http\Controllers;
// use App\Http\Requests\InventoryListAddNewAssetFormRequest;

use Inertia\Inertia;
use App\Models\Role;
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

        Role::updateRole($role, $validated);

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        return redirect()->route('role-management.index')->with('success', 'Role updated successfully.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        if (Gate::denies('delete-role', $role)) {
            return redirect()->route('unauthorized');
        }

        $role->delete();

        return redirect()->route('role-management.index')
            ->with('success', 'Role deleted successfully.');
    }
        
    public function updatePermissions(Request $request, Role $role)
    {
        $this->authorize('manage-permissions');

        $request->validate(['permissions' => 'array']);
        $role->permissions()->sync($request->permissions ?? []);

        return redirect()->route('role-management.index')->with('success', 'Permissions updated successfully.');
    }
}