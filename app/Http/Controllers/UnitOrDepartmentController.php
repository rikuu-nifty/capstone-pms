<?php

namespace App\Http\Controllers;
// use App\Http\Requests\InventoryListAddNewAssetFormRequest;
use Inertia\Inertia;
use App\Models\UnitOrDepartment;
use App\Models\InventoryList;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Http\RedirectResponse;

class UnitOrDepartmentController extends Controller
{
    private function indexProps(): array
    {
        return [
            'unit_or_departments' => UnitOrDepartment::listForIndex(),
            'totals'              => UnitOrDepartment::totals(),
        ];
    }
    
    public function index()
    {
        return Inertia::render('unit-or-departments/index', $this->indexProps());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255', Rule::unique('unit_or_departments', 'name')->whereNull('deleted_at')],
            'code'        => ['required', 'string', 'max:20', Rule::unique('unit_or_departments', 'code')->whereNull('deleted_at')],
            'description' => ['nullable', 'string'],
            'unit_head' => ['required', 'string', 'max:255'],
        ]);

        $data['code'] = strtoupper($data['code']);
        UnitOrDepartment::create($data);

        return redirect()->route('unit_or_departments.index')->with('success', 'New Unit/Department created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(UnitOrDepartment $unit)
    {
        $viewing = UnitOrDepartment::viewPropsById($unit->id);

        return Inertia::render('unit-or-departments/index', array_merge(
            $this->indexProps(),
            ['viewing' => $viewing]
        ));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UnitOrDepartment $unit)
    {
        $data = $request->validate([
            'name'=> ['required', 'string', 'max:255', Rule::unique('unit_or_departments', 'name')
                ->ignore($unit->id)
                ->whereNull('deleted_at')
            ],
            'code' => ['required', 'string', 'max:20',Rule::unique('unit_or_departments', 'code')->ignore($unit->id)
                ->whereNull('deleted_at')
            ],
            'description' => ['nullable', 'string'],
            'unit_head' => ['required', 'string', 'max:255'],
        ]);

        $data['code'] = strtoupper($data['code']);

        $unit->update($data);

        return redirect()->route('unit_or_departments.index')
            ->with('success', 'Unit/Department updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UnitOrDepartment $unit)
    {
        $unit->delete();

        return redirect()->route('unit_or_departments.index')
            ->with('success', 'Unit/Department deleted.');
    }
}
