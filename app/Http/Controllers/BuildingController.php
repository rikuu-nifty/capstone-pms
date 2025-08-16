<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use App\Models\Building;
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

        return [
            'buildings' => $buildings,
            'totals' => $totals,
        ];
    }

    public function index()
    {
        return Inertia::render('buildings/index', $this->indexProps());
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
        //
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
        //
    }
}
