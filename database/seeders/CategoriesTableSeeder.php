<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class CategoriesTableSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('categories')->delete();
        
        $categories = [
            ['id' => 1, 'name' => 'Tables', 'description' => 'All kinds of tables including executive, clerical, laboratory, dining, drafting, etc.'],
            ['id' => 2, 'name' => 'Chairs', 'description' => 'All types of chairs including executive, swivel, monobloc, stools, sofas, armchairs, etc.'],
            ['id' => 3, 'name' => 'Cabinets / Bookshelves', 'description' => 'Steel and wooden filing cabinets, bookshelves, detachable and built-in types.'],
            ['id' => 4, 'name' => 'Computers & IT Equipment', 'description' => 'Computer units, monitors, printers, projectors, and other IT peripherals.'],
            ['id' => 5, 'name' => 'Laboratory Equipment', 'description' => 'Equipment and apparatus for science, medical, dental, and engineering labs.'],
            ['id' => 6, 'name' => 'Electronics & Appliances', 'description' => 'Audio-visual, household, and office electronic appliances.'],
            ['id' => 7, 'name' => 'Vehicles', 'description' => 'Motor vehicles, service vehicles, motorcycles, and transport equipment.'],
        ];

        foreach ($categories as $c) {
            Category::create($c);
        }
    }
}
