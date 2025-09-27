<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

use App\Models\EquipmentCode;
use App\Models\Category;

class EquipmentCodeController extends Controller
{
    private function indexProps(): array
    {
        return [
            'equipment_codes' => EquipmentCode::withCategoryAndCounts(),
            'totals'          => EquipmentCode::getTotals(),
            'categories'      => EquipmentCode::getAllCategories(),
        ];
    }

    public function index()
    {
        return Inertia::render('equipment-codes/index', $this->indexProps());
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:10', Rule::unique('equipment_codes', 'code')],
            'description' => ['nullable', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
        ]);

        $record = EquipmentCode::create($validated);

        return redirect()->route('equipment-codes.index')
            ->with('success', "Equipment Code #{$record->id} ({$record->code}) was successfully created.");
    }

    public function show(EquipmentCode $equipmentCode)
    {
        $viewing = EquipmentCode::with(['category', 'assetModels'])->findOrFail($equipmentCode->id);

        return Inertia::render('equipment-codes/index', array_merge(
            $this->indexProps(),
            ['viewing' => $viewing],
        ));
    }

    public function update(Request $request, EquipmentCode $equipmentCode)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:10', Rule::unique('equipment_codes', 'code')->ignore($equipmentCode->id)],
            'description' => ['nullable', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
        ]);

        $equipmentCode->update($validated);

        return redirect()->route('equipment-codes.index')
            ->with('success', 'Equipment Code record was successfully updated.');
    }

    public function destroy(EquipmentCode $equipmentCode)
    {
        $equipmentCode->delete();

        return redirect()->route('equipment-codes.index')
            ->with('success', 'Equipment Code record was successfully deleted.');
    }
}
