<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionsTableSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            
            // USERS MANAGEMENT PAGE
            ['code' => 'view-users-page', 'name' => 'View Users Page'],
            ['code' => 'approve-users', 'name' => 'Approve Users'],
            ['code' => 'update-users', 'name' => 'Update Users'],
            ['code' => 'reset-user-password', 'name' => 'Reset User Password'],
            ['code' => 'send-email-change-request', 'name' => 'Send Email Change Request'],
            ['code' => 'delete-users', 'name' => 'Delete Users'],
            
            // ROLES & PERMISSIONS
            ['code' => 'view-roles-page', 'name' => 'View Roles Page'],
            ['code' => 'create-roles', 'name' => 'Create Roles'],
            ['code' => 'update-roles', 'name' => 'Update Roles'],
            ['code' => 'delete-role', 'name' => 'Delete Roles'],
            ['code' => 'update-permissions', 'name' => 'Update Permissions'],

            // INVENTORY SCHEDULING
            ['code' => 'view-inventory-scheduling', 'name' => 'View Inventory Scheduling'],
            ['code' => 'create-inventory-scheduling', 'name' => 'Create Inventory Scheduling'],
            ['code' => 'update-inventory-scheduling', 'name' => 'Update Inventory Scheduling'],
            ['code' => 'delete-inventory-scheduling', 'name' => 'Delete Inventory Scheduling'],

            //INVENTORY LIST
            ['code' => 'view-inventory-list', 'name' => 'View Inventory List'],
            ['code' => 'create-inventory-list', 'name' => 'Create Inventory List'],
            ['code' => 'update-inventory-list', 'name' => 'Update Inventory List'],
            ['code' => 'delete-inventory-list', 'name' => 'Delete Inventory List'],
            
            // TRANSFER
            ['code' => 'view-transfers', 'name' => 'View Transfers'],
            ['code' => 'create-transfers', 'name' => 'Create Transfers'],
            ['code' => 'update-transfers', 'name' => 'Update Transfers'],
            ['code' => 'delete-transfers', 'name' => 'Delete Transfers'],

            // TURNOVER / DISPOSAL
            ['code' => 'view-turnover-disposal', 'name' => 'View Turnover/Disposal'],
            ['code' => 'create-turnover-disposal', 'name' => 'Create Turnover/Disposal'],
            ['code' => 'update-turnover-disposal', 'name' => 'Update Turnover/Disposal'],
            ['code' => 'delete-turnover-disposal', 'name' => 'Delete Turnover/Disposal'],

            // OFF CAMPUS
            ['code' => 'view-off-campus', 'name' => 'View Off Campus'],
            ['code' => 'create-off-campus', 'name' => 'Create Off Campus'],
            ['code' => 'update-off-campus', 'name' => 'Update Off Campus'],
            ['code' => 'delete-off-campus', 'name' => 'Delete Off Campus'],
            ['code' => 'restore-off-campus', 'name' => 'Restore Off Campus'],

            // BUILDINGS
            ['code' => 'view-buildings', 'name' => 'View Buildings'],
            ['code' => 'create-buildings', 'name' => 'Create Buildings'],
            ['code' => 'update-buildings', 'name' => 'Update Buildings'],
            ['code' => 'delete-buildings', 'name' => 'Delete Buildings'],

            //BUILDING ROOMS
            ['code' => 'view-building-rooms', 'name' => 'View Building Rooms'],
            ['code' => 'create-building-rooms', 'name' => 'Create Building Rooms'],
            ['code' => 'update-building-rooms', 'name' => 'Update Building Rooms'],
            ['code' => 'delete-building-rooms', 'name' => 'Delete Building Rooms'],

            //CATEGORIES
            ['code' => 'view-categories', 'name' => 'View Categories'],
            ['code' => 'create-categories', 'name' => 'Create Categories'],
            ['code' => 'update-categories', 'name' => 'Update Categories'],
            ['code' => 'delete-categories', 'name' => 'Delete Categories'],

            //ASSET MODELS
            ['code' => 'view-asset-models', 'name' => 'View Asset Models'],
            ['code' => 'create-asset-models', 'name' => 'Create Asset Models'],
            ['code' => 'update-asset-models', 'name' => 'Update Asset Models'],
            ['code' => 'delete-asset-models', 'name' => 'Delete Asset Models'],

            //UNIT OR DEPARTMENTS
            ['code' => 'view-unit-or-departments', 'name' => 'View Unit or Departments'],
            ['code' => 'create-unit-or-departments', 'name' => 'Create Unit or Departments'],
            ['code' => 'update-unit-or-departments', 'name' => 'Update Unit or Departments'],
            ['code' => 'delete-unit-or-departments', 'name' => 'Delete Unit or Departments'],
            
            // FORM APPROVALS
            ['code' => 'view-form-approvals', 'name' => 'View Form Approvals'],
            ['code' => 'approve-form-approvals', 'name' => 'Approve Form Approvals'],
            ['code' => 'delete-form-approvals', 'name' => 'Delete Form Approvals'],
            
            // REPORTS
            ['code' => 'view-reports', 'name' => 'View Reports'],

            // ASSIGNMENTS
            ['code' => 'view-assignments', 'name' => 'View Assignments'],
            ['code' => 'create-assignments', 'name' => 'Create Assignments'],
            ['code' => 'update-assignments', 'name' => 'Update Assignments'],
            ['code' => 'delete-assignments', 'name' => 'Delete Assignments'],
                    
            // PROFILES
            ['code' => 'view-profile', 'name' => 'View Profile'],
            ['code' => 'manage-profile', 'name' => 'Manage Profile'],
        ];

        foreach ($permissions as $perm) {
            Permission::updateOrCreate(['code' => $perm['code']], $perm);
        }
    }
}
