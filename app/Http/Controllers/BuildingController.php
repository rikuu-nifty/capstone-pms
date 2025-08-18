<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use App\Models\Building;
use App\Models\BuildingRoom;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\StoreBuildingRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;


class BuildingController extends Controller
{
    
    private function indexProps(): array
    {
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
        
        $rooms = BuildingRoom::listAllRooms();
        $rooms->each(fn ($r) =>
            $r->asset_share = $totals['total_assets'] > 0
                ? round(((int) ($r->assets_count ?? 0)) / (int) $totals['total_assets'] * 100, 2)
                : 0.00
        );

        return [
            'buildings' => $buildings,
            'totals' => $totals,
            'rooms' => $rooms,
        ];
    }

    public function index(Request $request)
    {
        $indexProps = array_merge(
            $this->indexProps(),
            [
                'rooms' => BuildingRoom::listAllRooms(),
                'selectedBuilding' => $request->integer('selected'),
            ]
        );

        return Inertia::render('buildings/index', $indexProps);
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

            // Insert rooms if provided
            if (!empty($validated['rooms'])) {
                $now = now();

                // (Safety) Ensure uniqueness inside the batch by room (after trimming)
                // though the 'distinct' rule already handles it
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

            // Handle unique constraint violations gracefully
            // MySQL error code 1062 = duplicate entry
            if ((int) ($e->errorInfo[1] ?? 0) === 1062) {
                // We don’t know whether it’s the building code or a room collision.
                // Return a generic message + keep old input; you can inspect $e->getMessage() to customize.
                return back()
                    ->withErrors([
                        'code' => 'The building code or one of the room names already exists.',
                    ])
                    ->withInput();
            }

            throw $e; // bubble up anything else
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Building $building)
    {

        return Inertia::render('buildings/index', array_merge(
            $this->indexProps(),
            [
                'viewing' => Building::showPropsById($building->id),
            ],
        ));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Building $building)
    {
         $validated = $request->validate([
            'name' => ['required','string','max:255'],
            'code' => ['required','string','max:50', Rule::unique('buildings', 'code')
                ->whereNull('deleted_at')
                ->ignore($building->id),
            ],
            'description' => ['nullable','string','max:1000'],
        ]);

        $payload = [
            'name' => ucwords(trim($validated['name'])),
            'code' => strtoupper(trim($validated['code'])),
            'description' => $validated['description'] ? trim($validated['description']) : null,
        ];

        $building->update($payload);

        return redirect()->route('buildings.index')->with('success', 'Record was successfully updated');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Building $building)
    {
        $building->delete();

        return redirect()->route('buildings.index')->with('success', 'Building record was successfully deleted');
    }
}
