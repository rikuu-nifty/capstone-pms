<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OffCampusSignatory; // ✅ import the model

class OffCampusSignatoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaults = [
            [
                'role_key' => 'issued_by',
                'name'     => 'MARICEL G. CAPITULO',
                'title'    => 'Head, PMO',
            ],
        ];

        foreach ($defaults as $signatory) {
            OffCampusSignatory::updateOrCreate(
                ['role_key' => $signatory['role_key']],
                $signatory
            );
        }
    }
}
