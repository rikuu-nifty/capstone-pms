<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\AssetModel;
use App\Models\EquipmentCode;

class AssetModelsTableSeeder extends Seeder
{
    public function run(): void
    {
        // Find the "Computers & IT Equipment" category
        $computerCategory = Category::where('name', 'Computers & IT Equipment')->first();

        if (!$computerCategory) {
            $this->command->warn('⚠️ Skipping seeding Asset Models: "Computers & IT Equipment" category not found.');
            return;
        }

        // Look up equipment codes by their code values
        $cpuCode     = EquipmentCode::where('code', '402')->first(); // CPU
        $monitorCode = EquipmentCode::where('code', '401')->first(); // Computer monitor
        $laptopCode  = EquipmentCode::where('code', '425')->first(); // Laptop / tab

        $models = [
            [
                'brand' => 'Dell',
                'model' => 'OptiPlex 7090',
                'equipment_code_id' => $cpuCode?->id,
            ],
            [
                'brand' => 'HP',
                'model' => 'ProDesk 600',
                'equipment_code_id' => $cpuCode?->id,
            ],
            [
                'brand' => 'Apple',
                'model' => 'MacBook Air M1',
                'equipment_code_id' => $laptopCode?->id,
            ],
            [
                'brand' => 'Dell',
                'model' => 'UltraSharp U2720Q',
                'equipment_code_id' => $monitorCode?->id,
            ],
        ];

        foreach ($models as $m) {
            AssetModel::updateOrCreate(
                [
                    'brand' => $m['brand'],
                    'model' => $m['model'],
                ],
                [
                    'category_id'       => $computerCategory->id,
                    'equipment_code_id' => $m['equipment_code_id'],
                ]
            );
        }
    }
}
