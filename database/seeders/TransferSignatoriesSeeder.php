<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TransferSignatory; // ✅ import the model

class TransferSignatoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaults = [
            ['role_key' => 'approved_by', 'name'     => 'MARICEL G. CAPITULO','title'    => 'Head, Property Management',],
        ];

        foreach ($defaults as $signatory) {
            TransferSignatory::updateOrCreate(
                ['role_key' => $signatory['role_key']],
                $signatory
            );
        }
    }
}
