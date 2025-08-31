<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UnitOrDepartment;
use Illuminate\Support\Str;

class UnitOrDepartmentsTableSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            ['name' => 'Accounting Office', 'unit_head' => 'John Doe'],
            ['name' => 'IT Department', 'unit_head' => 'Jane Smith'],
            ['name' => 'Registrar', 'unit_head' => 'Mary Johnson'],
            ['name' => 'Library', 'unit_head' => 'Carlos Reyes'],
            ['name' => 'Facilities', 'unit_head' => 'Anna Lopez'],
        ];

        foreach ($units as $u) {
            UnitOrDepartment::updateOrCreate(
                ['name' => $u['name']],
                [
                    'code' => Str::slug($u['name'], '_'),
                    'unit_head' => $u['unit_head'], // ✅ required column filled
                ]
            );
        }
    }
}