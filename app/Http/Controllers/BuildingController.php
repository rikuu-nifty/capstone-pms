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
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Use the user-aware query for both the buildings list and totals
        $buildings = Building::indexProps($user);

        $totals = [
            'total_buildings' => $buildings->count(),
            'total_rooms'     => $buildings->sum('building_rooms_count'),
            'total_assets'    => $buildings->sum('assets_count'),
        ];

        $totals['avg_assets_per_building'] = $totals['total_buildings'] > 0
            ? round($totals['total_assets'] / $totals['total_buildings'], 2)
            : 0;

        $totals['avg_assets_per_room'] = $totals['total_rooms'] > 0
            ? round($totals['total_assets'] / $totals['total_rooms'], 2)
            : 0;

        $rooms = BuildingRoom::listAllRoomsWithAssetShare(
            (int) $totals['total_assets'],
            $user
        );

        return [
            'buildings' => $buildings,
            'totals'    => $totals,
            'rooms'     => $rooms,
        ];
    }

    public function index(Request $request)
    {
        $props = $this->indexProps();
        $props['selectedBuilding'] = $request->integer('selected');

        return Inertia::render('buildings/index', $props);
    }

    private function indexPropsForOwnUnit(): array
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $unitId = $user->unit_or_department_id;

        $buildings = Building::query()
            ->whereHas('assets', fn($q) => $q->where('unit_or_department_id', $unitId))
            ->withCount([
                'buildingRooms as building_rooms_count' => fn($q) =>
                $q->whereHas('assets', fn($qq) => $qq->where('unit_or_department_id', $unitId)),
                'assets as assets_count' => fn($q) =>
                $q->where('unit_or_department_id', $unitId),
            ])
            ->orderBy('id', 'desc')
            ->get();

        $totals = [
            'total_buildings' => $buildings->count(),
            'total_rooms'     => $buildings->sum('building_rooms_count'),
            'total_assets'    => $buildings->sum('assets_count'),
        ];

        $totals['avg_assets_per_building'] = $totals['total_buildings'] > 0
            ? round($totals['total_assets'] / $totals['total_buildings'], 2)
            : 0;

        $totals['avg_assets_per_room'] = $totals['total_rooms'] > 0
            ? round($totals['total_assets'] / $totals['total_rooms'], 2)
            : 0;

        $rooms = BuildingRoom::listAllRoomsWithAssetShareForUnit(
            (int) $totals['total_assets'],
            $unitId
        );

        return [
            'buildings' => $buildings,
            'totals'    => $totals,
            'rooms'     => $rooms,
        ];
    }

    public function ownUnitIndex(Request $request)
    {
        $user = Auth::user();

        if (!$user->unit_or_department_id) {
            return redirect()->route('unauthorized')
                ->with('unauthorized', 'You are not assigned to a unit or department.');
        }

        $props = $this->indexPropsForOwnUnit();
        $props['selectedBuilding'] = $request->integer('selected');

        return Inertia::render('buildings/index', array_merge($props, [
            'show_own_view' => true,
        ]));
        // dd([
        //     'current_url' => url()->current(),
        //     'user_id' => $user->id,
        //     'role' => $user->role?->code,
        //     'unit_id' => $user->unit_or_department_id,
        //     'permissions' => $user->role?->permissions->pluck('code'),
        // ]);
    }

    /**
     * Store a newly created resource in storage.
     */
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
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $isOwnUnitOnly = $user->hasPermission('view-own-unit-buildings') && !$user->hasPermission('view-buildings');

        $props = $isOwnUnitOnly
            ? $this->indexPropsForOwnUnit()
            : $this->indexProps();

        $viewing = $isOwnUnitOnly
            ? Building::showPropsByIdForUser($building->id)
            : Building::showPropsById($building->id);

        return Inertia::render('buildings/index', array_merge($props, [
            'viewing' => $viewing,
            'show_own_view' => $isOwnUnitOnly,
        ]));
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
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $isOwnUnitOnly = $user->hasPermission('view-own-unit-buildings') && !$user->hasPermission('view-buildings');

        $props = $isOwnUnitOnly
            ? $this->indexPropsForOwnUnit()
            : $this->indexProps();

        $totalAssets = (int) ($props['totals']['total_assets'] ?? 0);

        $room = $isOwnUnitOnly
            ? BuildingRoom::viewPropsByIdForUserWithAssetShare($buildingRoom->id, $totalAssets)
            : BuildingRoom::viewPropsByIdWithAssetShare($buildingRoom->id, $totalAssets);

        return Inertia::render('buildings/index', array_merge($props, [
            'viewingRoom'   => $room,
            'selected'      => (int) $room->building_id,
            'show_own_view' => $isOwnUnitOnly,
        ]));
    }
}
