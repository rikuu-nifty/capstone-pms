<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Personnel;
use App\Models\UnitOrDepartment;
use Carbon\Carbon;

class PersonnelsTableSeeder extends Seeder
{
    public function run(): void
    {
        $defaultUnit = UnitOrDepartment::first();

        $samples = [
            ['first_name' => 'Juan',     'middle_name' => 'Santos',   'last_name' => 'Dela Cruz',   'position' => 'CCS Program Chair',          'status' => 'active'],
            ['first_name' => 'Maria',    'middle_name' => 'Lopez',    'last_name' => 'Reyes',       'position' => 'CCS Dean',                   'status' => 'active'],
            ['first_name' => 'Jose',     'middle_name' => 'Garcia',   'last_name' => 'Rizal',       'position' => 'Laboratory Head',            'status' => 'active'],
            ['first_name' => 'Andres',   'middle_name' => 'Bonifacio', 'last_name' => 'Cruz',       'position' => 'CCS Secretary',              'status' => 'inactive'],
            ['first_name' => 'Gabriela', 'middle_name' => 'Silang',   'last_name' => 'Santos',      'position' => 'Faculty Member',             'status' => 'active'],
            ['first_name' => 'Antonio',  'middle_name' => 'Luna',     'last_name' => 'Velasco',     'position' => 'College Registrar',          'status' => 'active'],
            ['first_name' => 'Teodora',  'middle_name' => 'Alonzo',   'last_name' => 'Manalo',      'position' => 'Finance Officer',            'status' => 'active'],
            ['first_name' => 'Felipe',   'middle_name' => 'Delos',    'last_name' => 'Santos',      'position' => 'CSS Assistant Dean',         'status' => 'active'],
            ['first_name' => 'Rosa',     'middle_name' => 'Castillo', 'last_name' => 'Aquino',      'position' => 'CCS Guidance Counselor',     'status' => 'active'],
            ['first_name' => 'Carlos',   'middle_name' => 'Mendoza',  'last_name' => 'Torres',      'position' => 'IT Support Staff',           'status' => 'left_university'],
        ];

        foreach ($samples as $data) {
            Personnel::updateOrCreate(
                ['first_name' => $data['first_name'], 'last_name' => $data['last_name']],
                array_merge($data, [
                    'unit_or_department_id' => $defaultUnit?->id,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ])
            );
        }
    }
}
