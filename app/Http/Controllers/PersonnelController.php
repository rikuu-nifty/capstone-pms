<?php

namespace App\Http\Controllers;

use App\Models\Personnel;
use App\Models\UnitOrDepartment;
use App\Models\User;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class PersonnelController extends Controller
{

    private function indexProps(?Personnel $personnel = null): array
    {
        $users = $personnel ? Personnel::availableUsers()
            ->merge($personnel->user ? [$personnel->user] : [])
            ->unique('id')
            ->values()
            : Personnel::availableUsers()
        ;
            
        return [
            'personnels'    => Personnel::listForIndex(),
            // 'users'         => Personnel::usersForDropdown(),
            'users'         => $users,
            'units'         => UnitOrDepartment::listLite(),
            'totals'        => Personnel::totals(),
        ];
    }

    public function index(Request $request)
    {
        // Optional: detect if a specific personnel ID was pre-fetched via Inertia props
        $editingId = $request->input('editing_id');

        $personnel = $editingId
            ? Personnel::with('user')->find($editingId)
            : null;

        return Inertia::render('personnels/index', $this->indexProps($personnel));
        
        // return Inertia::render('personnels/index', $this->indexProps());
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

        // Sync department if linked to a user
        if (!empty($data['user_id']) && !empty($personnel->unit_or_department_id)) {
            User::where('id', $data['user_id'])->update(['unit_or_department_id' => $personnel->unit_or_department_id]);
        }

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

        // Prevent unit change if personnel has assets
        if (
            $personnel->unit_or_department_id !== $data['unit_or_department_id'] &&
            $personnel->assignments()->exists()
        ) {
            return back()->withErrors([
                'unit_or_department_id' => "This personnel has assigned assets. Please reassign or unassign them first."
            ]);
        }

        DB::transaction(function () use ($personnel, $data) {
            $personnel->update($data);

            // $personnel->refresh();

            if (!empty($data['user_id']) && !empty($personnel->unit_or_department_id)) {
                User::where('id', $data['user_id'])->update(['unit_or_department_id' => $personnel->unit_or_department_id]);
            }
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
