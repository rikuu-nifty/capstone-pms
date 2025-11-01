<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;
use App\Models\UnitOrDepartment;
use Carbon\Carbon;

class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        // Pick fallback units
        $defaultUnit = UnitOrDepartment::first(); // if nothing else exists
        $pmoUnit     = UnitOrDepartment::where('code', 'PMO')->first();
        $acctUnit    = UnitOrDepartment::where('code', 'ACCT')->first(); // example for variety

        // 🔹 Superuser
        $superRole = Role::where('code', 'superuser')->first();
        $superuser = User::updateOrCreate(
            ['email' => 'superuser@example.com'],
            [
                'name' => 'Root Superuser',
                'password' => Hash::make('password'),
                'status' => 'approved',
                'role_id' => $superRole?->id,
                'unit_or_department_id' => null, // superuser not tied to any unit
                'email_verified_at' => $now,
                'approved_at' => $now,
            ]
        );
        UserDetail::updateOrCreate(
            ['user_id' => $superuser->id],
            ['first_name' => 'Root', 'last_name' => 'Superuser']
        );

        // 🔹 VP Admin
        $vpRole = Role::where('code', 'vp_admin')->first();
        $vpAdmin = User::updateOrCreate(
            ['email' => 'vpadmin@example.com'],
            [
                'name' => 'Larry Carbonel',
                'password' => Hash::make('password'),
                'status' => 'approved',
                'role_id' => $vpRole?->id,
                'unit_or_department_id' => null, // VP Admin sees all
                'email_verified_at' => $now,
                'approved_at' => $now,
            ]
        );
        UserDetail::updateOrCreate(
            ['user_id' => $vpAdmin->id],
            ['first_name' => 'Larry', 'last_name' => 'Carbonel']
        );

        // 🔹 PMO Head
        $headRole = Role::where('code', 'pmo_head')->first();
        $pmoHead = User::updateOrCreate(
            ['email' => 'pmohead@example.com'],
            [
                'name' => 'Maricel Capitulo',
                'password' => Hash::make('password'),
                'status' => 'approved',
                'role_id' => $headRole?->id,
                'unit_or_department_id' => $pmoUnit?->id ?? $defaultUnit?->id,
                'email_verified_at' => $now,
                'approved_at' => $now,
            ]
        );
        UserDetail::updateOrCreate(
            ['user_id' => $pmoHead->id],
            ['first_name' => 'Maricel', 'last_name' => 'Capitulo']
        );

        // 🔹 PMO Staff (assigned to PMO unit by default)
        $staffRole = Role::where('code', 'pmo_staff')->first();

        $user = User::updateOrCreate(
            ['email' => 'user1@example.com'],
            [
                'name' => 'Staff User 1',
                'password' => Hash::make('password'),
                'status' => 'approved',
                'role_id' => $staffRole?->id,
                'unit_or_department_id' => $pmoUnit?->id ?? $defaultUnit?->id,
                'email_verified_at' => $now,
            ]
        );

        UserDetail::updateOrCreate(
            ['user_id' => $user->id],
            [
                'first_name' => 'User1',
                'last_name' => 'Lastname1',
            ]
        );

        // 🔹 Example: assign a Library user to Accounting unit
        $acctRole = Role::where('code', 'viewer')->first(); // e.g., viewer role
        $library = User::updateOrCreate(
            ['email' => 'library@example.com'],
            [
                'name' => 'Library Viewer',
                'password' => Hash::make('password'),
                'status' => 'approved',
                'role_id' => $acctRole?->id,
                'unit_or_department_id' => $acctUnit?->id ?? $defaultUnit?->id,
                'email_verified_at' => $now,
            ]
        );
        UserDetail::updateOrCreate(
            ['user_id' => $library->id],
            ['first_name' => 'Library', 'last_name' => 'Viewer']
        );
    }
}
