<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RoleHasPermissionsTableSeeder extends Seeder
{
    public function run(): void
    {
        $matrix = [
            // Superuser → all permissions
            'superuser' => Permission::pluck('id')->toArray(),

            // VP Admin: view-only for most, full control on Users, Roles, Form Approval, Profile
            'vp_admin' => [
                'view-inventory-scheduling',
                'view-transfers',
                'view-turnover-disposal',
                'view-off-campus',
                'view-reports',
                'view-assignments',
                'view-buildings',
                'view-unit-or-departments',

                // full control
                'view-users-page',
                'manage-users',
                'delete-users',
                'view-roles-page',
                'create-roles',
                'update-roles',
                'delete-roles',
                'update-permissions',
                'view-form-approvals',
                'manage-form-approvals',
                'delete-form-approvals',
                'view-profile',
                'manage-profile',
            ],

            // PMO Head: full control on most pages, but cannot delete roles
            'pmo_head' => [
                'view-inventory-scheduling',
                'manage-inventory-scheduling',
                'view-transfers',
                'manage-transfers',
                'view-turnover-disposal',
                'manage-turnover-disposal',
                'view-off-campus',
                'manage-off-campus',
                'view-reports',
                'view-assignments',
                'manage-assignments',
                'view-buildings',
                'manage-buildings',
                'view-unit-or-departments',
                'manage-unit-or-departments',
                'view-users-page',
                'manage-users',
                'delete-users',
                'view-roles-page',
                'manage-roles', // ❌ no delete-role
                'view-form-approvals',
                'manage-form-approvals',
                'delete-form-approvals',
                'view-profile',
                'manage-profile',
            ],

            // PMO Staff → operational access, limited view-only in some areas
            'pmo_staff' => [
                'view-inventory-scheduling',
                'manage-inventory-scheduling',
                'view-transfers',
                'manage-transfers',
                'view-turnover-disposal',
                'manage-turnover-disposal',
                'view-off-campus',
                'manage-off-campus',
                'view-reports', // view-only
                'view-assignments',
                'manage-assignments',
                'view-buildings',
                'manage-buildings',
                'view-unit-or-departments',
                'manage-unit-or-departments',
                'view-users',
                'manage-users',
                'view-form-approvals', // ❌ only view
                'view-profile',
                'manage-profile',
            ],
        ];

        foreach ($matrix as $roleCode => $permissions) {
            $role = Role::where('code', $roleCode)->first();

            if (!$role) continue;

            if ($roleCode === 'superuser') {
                $role->permissions()->sync($permissions); // all
            } else {
                $ids = Permission::whereIn('code', $permissions)->pluck('id');
                $role->permissions()->sync($ids);
            }
        }
    }
}
