<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategoriesTableSeeder extends Seeder
{
    public function run(): void
    {
        $categories = ['Computers', 'Furniture', 'Laboratory Equipment', 'Vehicles', 'Electronics'];

        foreach ($categories as $c) {
            Category::updateOrCreate(['name' => $c]);
        }
    }
}
