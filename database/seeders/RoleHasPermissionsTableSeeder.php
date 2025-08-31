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
                'view-dashboard',
                'view-calendar',
                'view-inventory-scheduling',
                'view-transfers',
                'view-turnover',
                'view-off-campus',
                'view-reports',
                'view-assignments',
                'view-buildings',
                'view-organizations',

                // full control
                'view-users',
                'manage-users',
                'delete-users',
                'view-roles',
                'manage-roles',
                'delete-role',
                'view-form-approval',
                'manage-form-approval',
                'delete-form-approval',
                'view-profile',
                'manage-profile',
            ],

            // PMO Head: full control on most pages, but cannot delete roles
            'pmo_head' => [
                'view-dashboard',
                'view-calendar',
                'view-inventory-scheduling',
                'manage-inventory-scheduling',
                'view-transfers',
                'manage-transfers',
                'view-turnover',
                'manage-turnover',
                'view-off-campus',
                'manage-off-campus',
                'view-reports',
                'view-assignments',
                'manage-assignments',
                'view-buildings',
                'manage-buildings',
                'view-organizations',
                'manage-organizations',
                'view-users',
                'manage-users',
                'delete-users',
                'view-roles',
                'manage-roles', // ❌ no delete-role
                'view-form-approval',
                'manage-form-approval',
                'delete-form-approval',
                'view-profile',
                'manage-profile',
            ],

            // PMO Staff → operational access, limited view-only in some areas
            'pmo_staff' => [
                'view-dashboard',
                'view-calendar',
                'view-inventory-scheduling',
                'manage-inventory-scheduling',
                'view-transfers',
                'manage-transfers',
                'view-turnover',
                'manage-turnover',
                'view-off-campus',
                'manage-off-campus',
                'view-reports', // view-only
                'view-assignments',
                'manage-assignments',
                'view-buildings',
                'manage-buildings',
                'view-organizations',
                'manage-organizations',
                'view-users',
                'manage-users',
                'view-form-approval', // ❌ only view
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
