<?php

namespace App\Http\Controllers;
// use App\Http\Requests\InventoryListAddNewAssetFormRequest;
use Inertia\Inertia;
use App\Models\AssetModel;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Http\RedirectResponse;


class AssetModelController extends Controller
{
    private function indexProps(): array
    {
        $models = AssetModel::withCategoryAndCounts()->get();
        $totals = AssetModel::getTotals();

        $categories = AssetModel::categoriesForDropdown();

        return [
            'asset_models' => $models,
            'totals' => $totals,
            'categories' => $categories,
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('models/index', $this->indexProps());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand'       => ['nullable', 'string', 'max:255'],
            'model'       => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'status'      => ['required', Rule::in(['active', 'is_archived'])],
        ]);

        // Enforce unique (category_id, brand, model) while ignoring soft-deleted rows
        $request->validate([
            'model' => [
                Rule::unique('asset_models', 'model')
                    ->where(fn ($q) => $q
                        ->where('category_id', $request->integer('category_id'))
                        ->where('brand', $request->input('brand'))
                        ->whereNull('deleted_at')
                    ),
            ],
        ]);

        $model = AssetModel::create($validated);
        $recId = $model->id;

        return 
            redirect()->route('asset-models.index')->with('success', "Record #{$recId} was successfully created");
    }

    /**
     * Display the specified resource.
     */
    public function show(AssetModel $assetModel)
    {
        $viewing = AssetModel::withCountsAndCategory()->findOrFail($assetModel->id);

        return Inertia::render('asset-models/index', array_merge(
            $this->indexProps(),
            ['viewing' => $viewing],
        ));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AssetModel $assetModel)
    {
        $validated = $request->validate([
            'brand'       => ['nullable', 'string', 'max:255'],
            'model'       => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'status'      => ['required', Rule::in(['active', 'is_archived'])],
        ]);

        // Unique combo, ignoring current record + soft-deleted rows
        $request->validate([
            'model' => [
                Rule::unique('asset_models', 'model')
                    ->ignore($assetModel->id)
                    ->where(fn ($q) => $q
                        ->where('category_id', $request->integer('category_id'))
                        ->where('brand', $request->input('brand'))
                        ->whereNull('deleted_at')
                    ),
            ],
        ]);

        $assetModel->update($validated);

        return redirect()
            ->route('asset-models.index')
            ->with('success', 'Record was successfully updated');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AssetModel $assetModel)
    {
       $assetModel->delete();

        return redirect()
            ->route('asset-models.index')
            ->with('success', 'Asset model record was successfully deleted');
    }
}
