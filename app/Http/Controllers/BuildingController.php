<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use App\Models\Building;
use App\Models\BuildingRoom;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;

use App\Http\Requests\StoreBuildingRequest;

class BuildingController extends Controller
{
    
    private function indexProps(): array
    {
        $user = Auth::user();

        $buildings = Building::indexProps();
        
        $totals = [
            'total_buildings' => $buildings->count(),
            'total_rooms' => $buildings->sum('building_rooms_count'),
            'total_assets' => $buildings->sum('assets_count'),
        ];
        
        $totals['avg_assets_per_building'] = $totals['total_buildings'] > 0
            ? round($totals['total_assets'] / $totals['total_buildings'], 2)
            : 0
        ;

        $totals['avg_assets_per_room'] = $totals['total_rooms'] > 0
            ? round($totals['total_assets'] / $totals['total_rooms'], 2)
            : 0
        ;

        // Filtered buildings + rooms depending on user permissions
        $buildings = Building::indexProps($user);
        $rooms     = BuildingRoom::listAllRoomsWithAssetShare((int) $totals['total_assets'], $user);

        return [
            'buildings' => $buildings,
            'totals' => $totals,
            'rooms' => $rooms,
        ];
    }

    public function index(Request $request)
    {
        $props = $this->indexProps();
        $props['selectedBuilding'] = $request->integer('selected');

        return Inertia::render('buildings/index', $props);
    }

    /**
     * Store a newly created resource in storage.
     */
    // public function store(Request $request)
    // {
    //     $validated = $request->validate([
    //         'name' => ['required', 'string', 'max:255'],
    //         'code' => ['required', 'string', 'max:50',
    //             Rule::unique('buildings', 'code')
    //             ->whereNull('deleted_at'),
    //         ],
    //         'description' => ['nullable', 'string', 'max:1000'],
    //     ]);

    //     $payload = [
    //         'name' => ucwords(trim($validated['name'])),
    //         'code' => strtoupper(trim($validated['code'])),
    //         'description' => $validated['description'] ? trim($validated['description']) : null,
    //     ];

    //     $building = Building::create($payload);

    //     return redirect()->route('buildings.index')->with('success', "Building {$building->name} was successfully created.");
    // }

    public function store(StoreBuildingRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            // Create building
            $building = Building::create([
                'name' => $validated['name'],
                'code' => $validated['code'],
                'description' => $validated['description'] ?? null,
            ]);

            if (!empty($validated['rooms'])) {
                $now = now();

                $roomsBatch = collect($validated['rooms'])
                    ->unique(fn ($r) => mb_strtolower($r['room']))
                    ->map(fn ($r) => [
                        'building_id' => $building->id,
                        'room' => $r['room'],
                        'description' => $r['description'] ?? null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ])
                    ->values()
                    ->all();

                if (!empty($roomsBatch)) {
                    BuildingRoom::insert($roomsBatch);
                }
            }

            DB::commit();

            return redirect()
                ->back()
                ->with('success', 'Building created successfully.');
        } catch (QueryException $e) {
            DB::rollBack();

            if ((int) ($e->errorInfo[1] ?? 0) === 1062) {
                
                return back()
                    ->withErrors([
                        'code' => 'The building code or one of the room names already exists.',
                    ])
                    ->withInput();
            }

            throw $e;
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Building $building)
    {
        /** @var User $user */
        $user = Auth::user();

        $viewing = $user->hasPermission('view-own-unit-buildings') && !$user->hasPermission('view-buildings')
            ? Building::showPropsByIdForUser($building->id)
            : Building::showPropsById($building->id);

        return Inertia::render('buildings/index', array_merge(
            $this->indexProps(),
            [
                'viewing' => $viewing,
            ],
        ));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Building $building)
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'code'                => 'nullable|string|max:50',
            'description'         => 'nullable|string|max:1000',
            'selected_rooms'      => 'array',
            'selected_rooms.*'    => 'integer|exists:building_rooms,id',
            'rooms'               => 'array',
            'rooms.*.room'        => 'required_with:rooms|string|max:255',
            'rooms.*.description' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($validated, $building) {
            $building->update([
                'name'        => trim($validated['name']),
                'code'        => strtoupper(trim($validated['code'] ?? '')),
                'description' => $validated['description'] ?? null,
            ]);

            $roomIds = collect($validated['selected_rooms'] ?? [])->unique()->values();

            if ($roomIds->isNotEmpty()) {
                BuildingRoom::whereIn('id', $roomIds)
                    ->where('building_id', $building->id)
                    ->update(['building_id' => $building->id])
                ;
            }

            if (!empty($validated['rooms'])) {
                $now = now();

                $newRooms = collect($validated['rooms'])
                    ->unique(fn($r) => mb_strtolower($r['room']))
                    ->map(fn($r) => [
                        'building_id' => $building->id,
                        'room'        => trim($r['room']),
                        'description' => $r['description'] ?? null,
                        'created_at'  => $now,
                        'updated_at'  => $now,
                    ])
                    ->values()
                    ->all();

                if (!empty($newRooms)) {
                    BuildingRoom::insert($newRooms);
                }
            }
        });

        return back()->with('success', 'Building updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Building $building)
    {
        $building->delete();

        return redirect()->route('buildings.index')->with('success', 'Building record was successfully deleted');
    }

    public function showRoom(BuildingRoom $buildingRoom)
    {
        $props = $this->indexProps();
        $totalAssets = (int) ($props['totals']['total_assets'] ?? 0);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $room = $user->hasPermission('view-own-unit-buildings')
            && !$user->hasPermission('view-buildings')
            ? BuildingRoom::viewPropsByIdForUserWithAssetShare($buildingRoom->id, $totalAssets)
            : BuildingRoom::viewPropsByIdWithAssetShare($buildingRoom->id, $totalAssets);

        return Inertia::render('buildings/index', array_merge(
            $this->indexProps(),
            [
                'viewingRoom' => $room,
                'selected'    => (int) $room->building_id,
            ],
        ));
    }

    
}
