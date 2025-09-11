<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use App\Http\Requests\StoreBuildingRoomRequest;
use App\Http\Requests\UpdateBuildingRoomRequest;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

use App\Models\BuildingRoom;
use App\Models\SubArea;

class BuildingRoomController extends Controller
{
    public function store(StoreBuildingRoomRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            $room = BuildingRoom::create([
                'building_id' => (int) $validated['building_id'],
                'room'        => trim($validated['room']),
                'description' => isset($validated['description'])
                    ? (trim($validated['description']) ?: null)
                    : null,
            ]);

            if (!empty($validated['sub_areas'])) {
                foreach ($validated['sub_areas'] as $sa) {
                    SubArea::create([
                        'building_room_id' => $room->id,
                        'name'             => trim($sa['name']),
                        'description'      => isset($sa['description']) && $sa['description'] !== ''
                            ? trim($sa['description'])
                            : null,
                    ]);
                }
            }

            DB::commit();

            return redirect()
                ->route('buildings.index')
                ->with('success', "Room “{$room->room}” was successfully created.");

        } catch (QueryException $e) {
            DB::rollBack();

            if ((int) ($e->errorInfo[1] ?? 0) === 1062) {
                return back()
                    ->withErrors(['room' => 'This room already exists for the selected building.'])
                    ->withInput();
            }
            throw $e;
        }
    }

    public function update(UpdateBuildingRoomRequest $request, BuildingRoom $buildingRoom): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $buildingRoom) {
            $buildingRoom->update([
                'building_id' => (int) $validated['building_id'],
                'room'        => trim($validated['room']),
                'description' => isset($validated['description'])
                    ? (trim($validated['description']) ?: null)
                    : null,
            ]);

            if (isset($validated['remove_sub_area_ids'])) {
                SubArea::whereIn('id', $validated['remove_sub_area_ids'])
                    ->where('building_room_id', $buildingRoom->id)
                    ->delete()
                ;
            }

            if (!empty($validated['sub_areas'])) {
                foreach ($validated['sub_areas'] as $sa) {
                    if (!empty($sa['id'])) {
                        // update existing
                        SubArea::where('id', $sa['id'])
                            ->where('building_room_id', $buildingRoom->id)
                            ->update([
                                'name'        => trim($sa['name']),
                                'description' => isset($sa['description']) ? trim($sa['description']) : null,
                            ]);
                    } else {
                        // new sub area
                        SubArea::create([
                            'building_room_id' => $buildingRoom->id,
                            'name'             => trim($sa['name']),
                            'description'      => isset($sa['description']) ? trim($sa['description']) : null,
                        ]);
                    }
                }
            }
        });
        
        return redirect()->route('buildings.index')->with('success', "Room “{$buildingRoom->room}” was successfully updated.");
    }

    public function destroy(BuildingRoom $buildingRoom)
    {
        $buildingRoom->delete();

        return redirect()->route('buildings.index')->with('success', 'Room was successfully deleted.');
    }
}
