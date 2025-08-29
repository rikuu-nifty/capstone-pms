<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
// use App\Models\User;

use Database\Seeders\RolesTableSeeder;
use Database\Seeders\PermissionsTableSeeder;
use Database\Seeders\RoleHasPermissionsTableSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        $this->call([
            RolesTableSeeder::class,
            PermissionsTableSeeder::class,
            RoleHasPermissionsTableSeeder::class,
        ]);
    }
}
