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
        return [
            'asset_models' => AssetModel::forIndex(),
            'totals' => AssetModel::getTotals(),
            'categories' => AssetModel::categoriesForDropdown(),
        ];
    }

    public function index()
    {
        return Inertia::render('models/index', $this->indexProps());
    }

    public function store(Request $request)
    {
        $brand = trim((string) $request->input('brand', ''));

        $request->merge([
            'brand'  => $brand === '' ? null : $brand,
            'model'  => trim($request->input('model', '')),
            'status' => $request->input('status', 'active'),
        ]);

        $input['brand'] = trim((string) ($input['brand'] ?? ''));
        $input['brand'] = $input['brand'] === '' ? null : $input['brand'];
        $input['model'] = trim((string) ($input['model'] ?? ''));
        $input['status'] = $input['status'] ?? 'active';

        $validated = $request->validate([
            'brand' => ['nullable', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255',
                Rule::unique('asset_models', 'model')->where(function ($q) use ($request) {
                    $q->where('category_id', $request->integer('category_id'))
                    ->whereNull('deleted_at');

                    if ($request->filled('brand')) {
                        $q->where('brand', $request->input('brand'));
                    } else {
                        $q->whereNull('brand');
                    }
                }),
            ],
            'category_id' => ['required', 'integer',
                Rule::exists('categories', 'id')->whereNull('deleted_at'),
            ],
            'status' => ['required', Rule::in(['active', 'is_archived'])],
        ], [
            'model.unique' => 'This brand/model already exists in the selected category.',
        ]);

        $model = AssetModel::create($validated);

        return redirect()->route('asset-models.index')->with('success', "Asset Model #{$model->id} was successfully created");
    }

    public function show(AssetModel $assetModel)
    {
       $viewing = AssetModel::findForView($assetModel->id);

        return Inertia::render('models/index', array_merge(
            $this->indexProps(),
            ['viewing' => $viewing],
        ));
    }

    public function update(Request $request, AssetModel $assetModel)
    {
        $validated = $request->validate([
            'brand'       => ['nullable', 'string', 'max:255'],
            'model'       => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'status'      => ['required', Rule::in(['active', 'is_archived'])],
        ]);

        $request->validate([
            'model' => [
                Rule::unique('asset_models', 'model')
                    ->ignore($assetModel->id)
                    ->where(fn ($q) => $q
                        ->where('category_id', $request->integer('category_id'))
                        ->when($request->filled('brand'),
                            fn($q) => $q->where('brand', $request->input('brand')),
                            fn($q) => $q->whereNull('brand')
                        )
                        ->whereNull('deleted_at')
                    ),
            ],
        ]);

        $assetModel->update($validated);

        return redirect()->route('asset-models.index')->with('success', 'Record was successfully updated');
    }

    public function destroy(AssetModel $assetModel)
    {
       $assetModel->delete();

        return redirect()
            ->route('asset-models.index')
            ->with('success', 'Asset model record was successfully deleted');
    }
}
