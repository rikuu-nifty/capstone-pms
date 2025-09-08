<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\InventorySchedulingSignatory; // ✅ import the model

class InventorySchedulingSignatoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
     public function run(): void
    {
        $defaults = [
            ['role_key' => 'prepared_by', 'name' => 'Juan Dela Cruz', 'title' => 'Property Clerk'],
            ['role_key' => 'approved_by', 'name' => 'LARRY R. CARBONEL', 'title' => 'VP for Administration'],
            ['role_key' => 'received_by', 'name' => 'LEONARDO G. DALUSUNG', 'title' => 'Internal Auditor'],
            ['role_key' => 'noted_by', 'name' => 'MARICEL G. CAPITULO', 'title' => 'Head, Property Management'],
        ];

            foreach ($defaults as $signatory) {
            InventorySchedulingSignatory::updateOrCreate(
                ['role_key' => $signatory['role_key']],
                $signatory
            );
        }
    }
}
