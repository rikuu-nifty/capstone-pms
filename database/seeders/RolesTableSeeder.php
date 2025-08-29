<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RolesTableSeeder extends Seeder
{
    public function run(): void
    {
        Role::updateOrCreate(['code' => 'vp_admin'], [
            'name' => 'VP Admin',
        ]);

        Role::updateOrCreate(['code' => 'pmo_head'], [
            'name' => 'PMO Head',
        ]);

        Role::updateOrCreate(['code' => 'pmo_staff'], [
            'name' => 'PMO Staff',
        ]);
    }
}
