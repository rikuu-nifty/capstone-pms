<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\InventoryList;
use App\Models\Building;
use App\Models\BuildingRoom;
use App\Models\UnitOrDepartment;
use App\Models\AssetModel;
use App\Models\Category;

class InventoryListsTableSeeder extends Seeder
{
    public function run(): void
    {
        $building = Building::first();
        $room = BuildingRoom::first();
        $unit = UnitOrDepartment::first();
        $assetModel = AssetModel::first();
        $category = Category::first();

        for ($i = 1; $i <= 40; $i++) {
            InventoryList::updateOrCreate(
                ['serial_no' => "SN-000{$i}"], // unique key
                [
                    'memorandum_no' => 1000 + $i,
                    'asset_name' => "Sample Asset {$i}",
                    'description' => "Description for Sample Asset {$i}",
                    'status' => 'active', // ✅ valid value
                    // 'transfer_status' => 'not_transferred', // ✅ valid value
                    'unit_or_department_id' => $unit?->id,
                    'building_id' => $building?->id,
                    'building_room_id' => $room?->id,
                    'asset_model_id' => $assetModel?->id,
                    'category_id' => $category?->id,
                    'supplier' => "Supplier {$i}",
                    'unit_cost' => rand(5000, 20000),
                    'date_purchased' => now()->subYears(rand(0, 5))->toDateString(),
                    'asset_type' => 'Equipment',
                    'quantity' => rand(1, 10),
                ]
            );
        }
    }
}