<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use App\Models\Building;
use App\Models\BuildingRoom;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Http\RedirectResponse;


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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50',
                Rule::unique('buildings', 'code')
                ->whereNull('deleted_at'),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $payload = [
            'name' => ucwords(trim($validated['name'])),
            'code' => strtoupper(trim($validated['code'])),
            'description' => $validated['description'] ? trim($validated['description']) : null,
        ];

        $building = Building::create($payload);

        return redirect()->route('buildings.index')->with('success', "Building {$building->name} was successfully created.");
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
