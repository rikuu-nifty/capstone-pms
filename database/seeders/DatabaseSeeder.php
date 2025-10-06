<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
// use App\Models\User;

use Database\Seeders\RolesTableSeeder;
use Database\Seeders\PermissionsTableSeeder;
use Database\Seeders\RoleHasPermissionsTableSeeder;
use Database\Seeders\UsersTableSeeder;
use Database\Seeders\UnitOrDepartmentsTableSeeder;
use Database\Seeders\BuildingsTableSeeder;
use Database\Seeders\BuildingRoomsTableSeeder;
use Database\Seeders\CategoriesTableSeeder;
use Database\Seeders\AssetModelsTableSeeder;
use Database\Seeders\InventoryListsTableSeeder;
use Database\Seeders\PersonnelsTableSeeder;
use Database\Seeders\EquipmentCodesTableSeeder;
use Database\Seeders\InventorySchedulingSignatoriesSeeder;
use Database\Seeders\TransferSignatoriesSeeder;
use Database\Seeders\TurnoverDisposalSignatoriesSeeder;

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
            PermissionsTableSeeder::class,
            RolesTableSeeder::class,
            RoleHasPermissionsTableSeeder::class,
            UsersTableSeeder::class,
            UnitOrDepartmentsTableSeeder::class,
            BuildingsTableSeeder::class,
            BuildingRoomsTableSeeder::class,
            CategoriesTableSeeder::class,
            AssetModelsTableSeeder::class,
            InventoryListsTableSeeder::class,
            InventorySchedulingSignatoriesSeeder::class,
            PersonnelsTableSeeder::class,
            EquipmentCodesTableSeeder::class,
            InventorySchedulingSignatoriesSeeder::class,
            TransferSignatoriesSeeder::class,
            TurnoverDisposalSignatoriesSeeder::class,
        ]);
    }
}
