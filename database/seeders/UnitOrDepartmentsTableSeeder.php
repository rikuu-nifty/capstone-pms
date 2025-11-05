<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UnitOrDepartment;

class UnitOrDepartmentsTableSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            [
                'name' => 'Property Management Office',
                'code' => 'PMO',
                'unit_head' => 'Maricel Capitulo',
            ],
            [
                'name' => 'Accounting Office',
                'code' => 'ACC',
                'unit_head' => 'Jane Smith',
            ],
            [
                'name' => 'Registrar',
                'code' => 'REG',
                'unit_head' => 'Mary Johnson',
            ],
            [
                'name' => 'Library',
                'code' => 'LIB',
                'unit_head' => 'Carlos Reyes',
            ],
            [
                'name' => 'Facilities',
                'code' => 'FAC',
                'unit_head' => 'Anna Lopez',
            ],
        ];

        foreach ($units as $u) {
            UnitOrDepartment::updateOrCreate(
                ['name' => $u['name']],
                [
                    'code' => $u['code'],
                    'unit_head' => $u['unit_head'],
                ]
            );
        }
    }
}
