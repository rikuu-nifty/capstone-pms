<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;

class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        // Superuser role lookup (safe)
        $superRole = Role::where('code', 'superuser')->first();

        $superuser = User::updateOrCreate(
            ['email' => 'superuser@example.com'],
            [
                'name' => 'Root Superuser',
                'password' => Hash::make('password'),
                'status' => 'approved',
                'role_id' => $superRole?->id,
            ]
        );

        UserDetail::updateOrCreate(
            ['user_id' => $superuser->id],
            [
                'first_name' => 'Root',
                'last_name' => 'Superuser',
                'middle_name' => null,
            ]
        );

        // VP Admin
        $vpRole = Role::where('code', 'vp_admin')->first();
        $vpAdmin = User::updateOrCreate(
            ['email' => 'vpadmin@example.com'],
            [
                'name' => 'VP Admin',
                'password' => Hash::make('password'),
                'status' => 'approved',
                'role_id' => $vpRole?->id,
            ]
        );

        UserDetail::updateOrCreate(
            ['user_id' => $vpAdmin->id],
            [
                'first_name' => 'VP',
                'last_name' => 'Admin',
                'middle_name' => null,
            ]
        );

        // PMO Head
        $headRole = Role::where('code', 'pmo_head')->first();
        $pmoHead = User::updateOrCreate(
            ['email' => 'pmohead@example.com'],
            [
                'name' => 'PMO Head',
                'password' => Hash::make('password'),
                'status' => 'approved',
                'role_id' => $headRole?->id,
            ]
        );

        UserDetail::updateOrCreate(
            ['user_id' => $pmoHead->id],
            [
                'first_name' => 'PMO',
                'last_name' => 'Head',
                'middle_name' => null,
            ]
        );

        // Example PMO Staff accounts
        $staffRole = Role::where('code', 'pmo_staff')->first();
        for ($i = 1; $i <= 5; $i++) {
            $user = User::updateOrCreate(
                ['email' => "user{$i}@example.com"],
                [
                    'name' => "Staff User {$i}",
                    'password' => Hash::make('password'),
                    'status' => 'approved',
                    'role_id' => $staffRole?->id,
                ]
            );

            UserDetail::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'first_name' => "User{$i}",
                    'last_name' => "Lastname{$i}",
                    'middle_name' => null,
                ]
            );
        }
    }
}