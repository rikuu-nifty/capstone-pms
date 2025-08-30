<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Building;
use App\Models\BuildingRoom;

class BuildingRoomsTableSeeder extends Seeder
{
    public function run(): void
    {
        $building = Building::first();

        $rooms = ['101', '102', '201', '202', '301'];

        foreach ($rooms as $r) {
            BuildingRoom::updateOrCreate(
                [
                    'room' => $r, 
                    'building_id' => $building->id,
                ],
                [
                    'description' => "Room {$r}",
                ]
            );
        }
    }
}