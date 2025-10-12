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
                'view-all-inventory-list',
                'view-inventory-scheduling',
                'view-transfers',
                'view-turnover-disposal',
                'view-off-campus',

                'view-categories',
                'view-equipment-codes',
                'view-asset-models',
                'view-assignments',
                
                'view-buildings',
                'view-building-rooms',
                'view-personnels',
                'view-unit-or-departments',

                // USERS
                'view-users-page',
                'approve-users',
                'reset-user-password',
                'send-email-change-request',
                'delete-users',
                
                // ROLE MANAGEMENT
                'view-roles-page',
                'create-roles',
                'update-roles',
                'delete-role',
                'update-permissions',
                
                // FORM APPROVAL
                'view-form-approvals',
                'approve-form-approvals',
                'delete-form-approvals',
                
                'view-signatories',

                'view-notifications',
                'view-reports',
                'view-trash-bin', // No trash bin perms, only view
                'view-audit-logs',

                // PROFILE
                'view-profile',
                'manage-profile',
            ],

            'pmo_head' => [
                // INVENTORY LIST
                'view-all-inventory-list',
                'view-own-unit-inventory-list',
                'create-inventory-list',
                'update-inventory-list',
                'delete-inventory-list',
                
                // INVENTORY SCHEDULING
                'view-inventory-scheduling',
                'create-inventory-scheduling',
                'update-inventory-scheduling',
                'delete-inventory-scheduling',

                // TRANSFERS
                'view-transfers',
                'create-transfers',
                'update-transfers',
                'delete-transfers',

                // TURNOVER DISPOSAL
                'view-turnover-disposal',
                'create-turnover-disposal',
                'update-turnover-disposal',
                'delete-turnover-disposal',

                // OFF CAMPUS
                'view-off-campus',
                'create-off-campus',
                'update-off-campus',
                'delete-off-campus',
                'restore-off-campus',

                // CATEGORIES
                'view-categories',
                'create-categories',
                'update-categories',
                'delete-categories',

                // EQUIPMENT CODES
                'view-equipment-codes',
                'create-equipment-codes',
                'update-equipment-codes',
                'delete-equipment-codes',

                // ASSET MODELS
                'view-asset-models',
                'create-asset-models',
                'update-asset-models',
                'delete-asset-models',
                
                // ASSIGNMENTS
                'view-assignments',
                'create-assignments',
                'update-assignments',
                'delete-assignments',

                // BUILDINGS
                'view-buildings',
                'create-buildings',
                'update-buildings',
                'delete-buildings',

                // BUILDING ROOMS
                'view-building-rooms',
                'create-building-rooms',
                'update-building-rooms',
                'delete-building-rooms',

                // PERSONNELS
                'view-personnels',
                'create-personnels',
                'update-personnels',
                'delete-personnels',

                // UNIT OR DEPARTMENTS
                'view-unit-or-departments',
                'create-unit-or-departments',
                'update-unit-or-departments',
                'delete-unit-or-departments',

                // USERS MANAGEMENT
                'view-users-page',
                'approve-users',
                'reset-user-password',
                'send-email-change-request',
                'delete-users',

                // ROLE MANAGEMENT
                'view-roles-page',
                'create-roles',
                'update-roles',
                'update-permissions',

                // FORM APPROVALS
                'view-form-approvals',
                'approve-form-approvals',
                'delete-form-approvals',

                // SIGNATORIES
                'view-signatories',
                'create-signatories',
                'update-signatories',
                'delete-signatories',

                // NOTIFICATIONS
                'view-notifications',
                'update-notifications',
                'archive-notifications',
                'delete-notifications',

                // REPORTS
                'view-reports',

                // TRASH BIN
                'view-trash-bin',
                'restore-trash-bin',
                'permanent-delete-trash-bin',

                // AUDIT LOG
                'view-audit-logs',

                // PROFILE
                'view-profile',
                'manage-profile',
            ],

            'pmo_staff' => [
                // INVENTORY LIST
                'view-all-inventory-list',
                'view-own-unit-inventory-list',
                'create-inventory-list',
                'update-inventory-list',
                'delete-inventory-list',

                // INVENTORY SCHEDULING
                'view-inventory-scheduling',
                'create-inventory-scheduling',
                'update-inventory-scheduling',
                'delete-inventory-scheduling',

                // TRANSFERS
                'view-transfers',
                'create-transfers',
                'update-transfers',
                'delete-transfers',

                // TURNOVER DISPOSAL
                'view-turnover-disposal',
                'create-turnover-disposal',
                'update-turnover-disposal',
                'delete-turnover-disposal',

                // OFF CAMPUS
                'view-off-campus',
                'create-off-campus',
                'update-off-campus',
                'delete-off-campus',
                'restore-off-campus',

                // CATEGORIES
                'view-categories',
                'create-categories',
                'update-categories',
                'delete-categories',

                // EQUIPMENT CODES
                'view-equipment-codes',
                'create-equipment-codes',
                'update-equipment-codes',
                'delete-equipment-codes',

                // ASSET MODELS
                'view-asset-models',
                'create-asset-models',
                'update-asset-models',
                'delete-asset-models',

                // ASSIGNMENTS
                'view-assignments',
                'create-assignments',
                'update-assignments',
                'delete-assignments',

                // BUILDINGS
                'view-buildings',
                'create-buildings',
                'update-buildings',
                'delete-buildings',

                // BUILDING ROOMS
                'view-building-rooms',
                'create-building-rooms',
                'update-building-rooms',
                'delete-building-rooms',

                // PERSONNELS
                'view-personnels',
                'create-personnels',
                'update-personnels',
                'delete-personnels',

                // UNIT OR DEPARTMENTS
                'view-unit-or-departments',
                'create-unit-or-departments',
                'update-unit-or-departments',
                'delete-unit-or-departments',

                // USERS MANAGEMENT - No user management perms

                // NO ROLE MANAGEMENT

                // FORM APPROVALS - No approval perms aside from view
                'view-form-approvals',

                // SIGNATORIES
                'view-signatories',
                'create-signatories',
                'update-signatories',
                'delete-signatories',

                // NOTIFICATIONS
                'view-notifications',
                'update-notifications',
                'archive-notifications',
                'delete-notifications',

                // REPORTS
                'view-reports',

                // TRASH BIN - No permanent delete for PMO Staff
                'view-trash-bin',
                'restore-trash-bin',

                // AUDIT LOG
                // 'view-audit-logs', //current unsure if staff should have access to audit logs

                // PROFILE
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
