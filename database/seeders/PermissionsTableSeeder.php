<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionsTableSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['code' => 'view-users-page', 'name' => 'View Users Page'],
            ['code' => 'assign-pmo-staff-role', 'name' => 'Assign PMO Staff Role'],
            ['code' => 'assign-pmo-head-role', 'name' => 'Assign PMO Head Role'],
            ['code' => 'delete-user', 'name' => 'Delete User'],
        ];

        foreach ($permissions as $perm) {
            Permission::updateOrCreate(['code' => $perm['code']], $perm);
        }
    }
}
