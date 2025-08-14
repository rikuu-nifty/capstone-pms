<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

use App\Models\Category;
use App\Models\AssetModel;


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
            'totals' => $totals
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        //
    }
}
