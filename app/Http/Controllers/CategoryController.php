<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

use App\Models\Category;


class CategoryController extends Controller
{

    private function indexProps(): array
    {
        // $createdBy = Auth::user();
        // $updatedBy = Auth::user();
        
        $categories = Category::withModelsAndCounts()->get();
        $totals = Category::getTotals();

        return [
            // 'createdBy'     =>  $createdBy,
            'categories' => $categories,
            'totals' => $totals //KPI totals
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('categories/index', $this->indexProps());
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
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('categories', 'name')],
            'description' => ['nullable', 'string'],
        ]);

        $category = Category::create($validated);
        $recordNum = $category->id;
        $recordName = $category->name;

        return redirect()->route('categories.index')->with('success', `Record #{$recordNum} "{$recordName}" was successfully created,`);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        $viewing = Category::findForView($category->id);

        return Inertia::render('categories/index', array_merge(
            $this->indexProps(),
            ['viewing' => $viewing],
        ));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('categories', 'name')->ignore($category->id)],
            'description' => ['nullable', 'string'],
        ]);

        $category->update($validated);

        return redirect()->route('categories.index')->with('success', 'Record was successfully updated');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->route('categories.index')->with('success', 'Category record was successfully deleted');
    }
}
