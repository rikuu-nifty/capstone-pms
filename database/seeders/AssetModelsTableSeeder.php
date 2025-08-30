<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\AssetModel;

class AssetModelsTableSeeder extends Seeder
{
    public function run(): void
    {
        $computerCategory = Category::where('name', 'Computers')->first();

        $models = [
            ['brand' => 'Dell', 'model' => 'OptiPlex 7090'],
            ['brand' => 'HP', 'model' => 'ProDesk 600'],
            ['brand' => 'Apple', 'model' => 'MacBook Air M1'],
        ];

        foreach ($models as $m) {
            AssetModel::updateOrCreate([
                'brand' => $m['brand'],
                'model' => $m['model'],
                'category_id' => $computerCategory->id,
            ]);
        }
    }
}
