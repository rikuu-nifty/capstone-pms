<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Building;
use Illuminate\Support\Str;

class BuildingsTableSeeder extends Seeder
{
    public function run(): void
    {
        $buildings = ['Main Building', 'Science Hall', 'Engineering Complex', 'Library', 'Gymnasium'];

        foreach ($buildings as $b) {
            Building::updateOrCreate(
                ['name' => $b],
                [
                    'code' => Str::slug($b, '_'), // ✅ generate code e.g. "main_building"
                ]
            );
        }
    }
}
