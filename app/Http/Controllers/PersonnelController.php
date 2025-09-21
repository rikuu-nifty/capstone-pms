<?php

namespace App\Http\Controllers;

use App\Models\Personnel;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class PersonnelController extends Controller
{

    private function indexProps(): array
    {
        return [
            'personnels' => Personnel::listForIndex(),
            'totals' => Personnel::totals(),
        ];
    }

    public function index()
    {
        return Inertia::render('personnels/index', $this->indexProps());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name'            => ['required', 'string', 'max:255'],
            'middle_name'           => ['nullable', 'string', 'max:255'],
            'last_name'             => ['required', 'string', 'max:255'],
            'user_id'               => ['nullable', Rule::exists('users', 'id')->whereNull('deleted_at')],

            'position'              => ['nullable', 'string', 'max:255'],
            'unit_or_department_id' => [ 'nullable', Rule::exists('unit_or_departments', 'id')->whereNull('deleted_at')],
            'status'                => ['required', Rule::in(['active', 'inactive', 'left_university'])],
        ]);

        $personnel = DB::transaction(function () use ($data) {
            return Personnel::create($data);
        });

        return redirect()->route('personnels.index')->with('success', "Personnel {$personnel->full_name} added successfully.");
    }

    public function update(Request $request, Personnel $personnel)
    {
        $data = $request->validate([
            'first_name'            => ['required', 'string', 'max:255'],
            'middle_name'           => ['nullable', 'string', 'max:255'],
            'last_name'             => ['required', 'string', 'max:255'],
            'user_id'               => ['nullable', Rule::exists('users', 'id')->whereNull('deleted_at')],

            'position'              => ['nullable', 'string', 'max:255'],
            'unit_or_department_id' => ['nullable', Rule::exists('unit_or_departments', 'id')->whereNull('deleted_at')],
            'status'                => ['required', Rule::in(['active', 'inactive', 'left_university'])],
        ]);

        DB::transaction(function () use ($personnel, $data) {
            $personnel->update($data);
        });

        return redirect()->route('personnels.index')->with('success', "Personnel {$personnel->fresh()->full_name} updated successfully.");
    }

    public function destroy(Personnel $personnel)
    {
        $fullName = $personnel->full_name;

        DB::transaction(function () use ($personnel) {
            $personnel->delete();
        });

        return redirect()->route('personnels.index')->with('success', "Personnel {$fullName} deleted successfully.");
    }
    
    /**
     * Display the specified resource.
     */
    public function show(Personnel $personnel)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Personnel $personnel)
    {
        //
    }

}
