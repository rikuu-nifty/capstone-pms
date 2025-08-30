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
                'role_id' => $superRole?->id, // ✅ dynamically linked
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