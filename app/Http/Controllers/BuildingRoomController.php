<?php

namespace App\Http\Controllers;

use App\Models\BuildingRoom;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\StoreBuildingRoomRequest;
use App\Http\Requests\UpdateBuildingRoomRequest;
use Illuminate\Database\QueryException;

class BuildingRoomController extends Controller
{
    public function store(StoreBuildingRoomRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        try {
            $room = BuildingRoom::create([
                'building_id' => (int) $validated['building_id'],
                'room'        => trim($validated['room']),
                'description' => isset($validated['description'])
                    ? (trim($validated['description']) ?: null)
                    : null,
            ]);

            return redirect()
                ->route('buildings.index')
                ->with('success', "Room “{$room->room}” was successfully created.");
        } catch (QueryException $e) {
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

        $buildingRoom->update([
            'building_id' => (int) $validated['building_id'],
            'room'        => trim($validated['room']),
            'description' => isset($validated['description'])
                ? (trim($validated['description']) ?: null)
                : null,
        ]);

        return redirect()->route('buildings.index')->with('success', "Room “{$buildingRoom->room}” was successfully updated.");
    }

    public function destroy(BuildingRoom $buildingRoom)
    {
        $buildingRoom->delete();

        return redirect()->route('buildings.index')->with('success', 'Room was successfully deleted.');
    }
}
