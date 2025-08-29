<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RoleHasPermissionsTableSeeder extends Seeder
{
    public function run(): void
    {
        $vpAdmin = Role::where('code', 'vp_admin')->first();
        $pmoHead = Role::where('code', 'pmo_head')->first();
        $pmoStaff = Role::where('code', 'pmo_staff')->first();

        $viewUsersPage = Permission::where('code', 'view-users-page')->first();
        $assignPMOStaffRole = Permission::where('code', 'assign-pmo-staff-role')->first();
        $assignPMOHeadRole = Permission::where('code', 'assign-pmo-head-role')->first();
        $deleteUser = Permission::where('code', 'delete-user')->first();

        if ($vpAdmin) {
            $vpAdmin->permissions()->sync(Permission::pluck('id'));
        }

        if ($pmoHead) {
            $pmoHead->permissions()->sync([
                $viewUsersPage->id,
                $assignPMOStaffRole->id,
            ]);
        }

        if ($pmoStaff) {
            $pmoStaff->permissions()->sync([]); //no perms
        }
    }
}
