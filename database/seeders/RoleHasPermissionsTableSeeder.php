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
            'superuser' => Permission::pluck('id')->toArray(),

            'vp_admin' => [
                'view-inventory-scheduling',
                'view-inventory-list',
                'view-transfers',
                'view-turnover-disposal',
                'view-off-campus',
                'view-reports',
                'view-assignments',
                'view-buildings',
                'view-building-rooms',
                'view-asset-models',
                'view-unit-or-departments',

                'view-users-page',
                'approve-users',
                'reset-user-password',
                'send-email-change-request',
                'delete-users',

                'view-roles-page',
                'create-roles',
                'update-roles',
                'delete-role',
                'update-permissions',

                'view-form-approvals',
                'approve-form-approvals',
                'delete-form-approvals',

                'view-profile',
                'manage-profile',
            ],

            'pmo_head' => [
                'view-inventory-scheduling',
                'create-inventory-scheduling',
                'update-inventory-scheduling',
                'delete-inventory-scheduling',

                'view-inventory-list',
                'create-inventory-list',
                'update-inventory-list',
                'delete-inventory-list',

                'view-transfers',
                'create-transfers',
                'update-transfers',
                'delete-transfers',

                'view-turnover-disposal',
                'create-turnover-disposal',
                'update-turnover-disposal',
                'delete-turnover-disposal',

                'view-off-campus',
                'create-off-campus',
                'update-off-campus',
                'delete-off-campus',
                'restore-off-campus',

                'view-assignments',
                'create-assignments',
                'update-assignments',
                'delete-assignments',

                'view-buildings',
                'create-buildings',
                'update-buildings',
                'delete-buildings',

                'view-building-rooms',
                'create-building-rooms',
                'update-building-rooms',
                'delete-building-rooms',

                'view-categories',
                'create-categories',
                'update-categories',
                'delete-categories',

                'view-asset-models',
                'create-asset-models',
                'update-asset-models',
                'delete-asset-models',

                'view-unit-or-departments',
                'create-unit-or-departments',
                'update-unit-or-departments',
                'delete-unit-or-departments',

                'view-users-page',
                'approve-users',
                'reset-user-password',
                'send-email-change-request',
                'delete-users',

                'view-roles-page',
                'create-roles',
                'update-roles',
                'update-permissions',

                'view-form-approvals',
                'approve-form-approvals',
                'delete-form-approvals',

                'view-profile',
                'manage-profile',
            ],

            'pmo_staff' => [
                'view-inventory-scheduling',
                'create-inventory-scheduling',
                'update-inventory-scheduling',
                'delete-inventory-scheduling',

                'view-inventory-list',
                'create-inventory-list',
                'update-inventory-list',
                'delete-inventory-list',

                'view-transfers',
                'create-transfers',
                'update-transfers',
                'delete-transfers',

                'view-turnover-disposal',
                'create-turnover-disposal',
                'update-turnover-disposal',
                'delete-turnover-disposal',

                'view-off-campus',
                'create-off-campus',
                'update-off-campus',
                'delete-off-campus',
                'restore-off-campus',

                'view-reports',

                'view-assignments',
                'create-assignments',
                'update-assignments',
                'delete-assignments',

                'view-buildings',
                'create-buildings',
                'update-buildings',
                'delete-buildings',

                'view-building-rooms',
                'create-building-rooms',
                'update-building-rooms',
                'delete-building-rooms',

                'view-categories',
                'create-categories',
                'update-categories',
                'delete-categories',

                'view-asset-models',
                'create-asset-models',
                'update-asset-models',
                'delete-asset-models',

                'view-unit-or-departments',
                'create-unit-or-departments',
                'update-unit-or-departments',
                'delete-unit-or-departments',

                'view-users-page',

                'view-form-approvals',

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
