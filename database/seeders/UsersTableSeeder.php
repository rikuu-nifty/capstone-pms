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
                'name' => 'VP Admin',
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
            ['first_name' => 'VP', 'last_name' => 'Admin']
        );

        // 🔹 PMO Head
        $headRole = Role::where('code', 'pmo_head')->first();
        $pmoHead = User::updateOrCreate(
            ['email' => 'pmohead@example.com'],
            [
                'name' => 'PMO Head',
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
            ['first_name' => 'PMO', 'last_name' => 'Head']
        );

        // 🔹 PMO Staff (assigned to PMO unit by default)
        $staffRole = Role::where('code', 'pmo_staff')->first();
        for ($i = 1; $i <= 5; $i++) {
            $user = User::updateOrCreate(
                ['email' => "user{$i}@example.com"],
                [
                    'name' => "Staff User {$i}",
                    'password' => Hash::make('password'),
                    'status' => 'approved',
                    'role_id' => $staffRole?->id,
                    'unit_or_department_id' => $pmoUnit?->id ?? $defaultUnit?->id,
                    'email_verified_at' => $now,
                ]
            );
            UserDetail::updateOrCreate(
                ['user_id' => $user->id],
                ['first_name' => "User{$i}", 'last_name' => "Lastname{$i}"]
            );
        }
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
