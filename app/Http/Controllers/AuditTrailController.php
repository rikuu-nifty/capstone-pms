<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\AuditTrail;
use Illuminate\Http\Request;

class AuditTrailController extends Controller
{   
    /**
     * Display a listing of the resource.
     */
  public function index(Request $request): Response
{
    $filters = $request->only(['from','to','actor_id','action','subject_type','search']);

    $baseQuery = AuditTrail::query()
        ->with(['actor', 'unitOrDepartment'])
        ->when($request->from, fn($q) => $q->whereDate('created_at', '>=', $request->from))
        ->when($request->to, fn($q) => $q->whereDate('created_at', '<=', $request->to))
        ->when($request->actor_id, fn($q) => $q->where('actor_id', $request->actor_id))
        ->when($request->action, fn($q) => $q->where('action', $request->action))
        ->when($request->subject_type, fn($q) => $q->where('subject_type', $request->subject_type))
        ->when($request->search, function ($q) use ($request) {
            $term = '%' . $request->search . '%';
            $q->where(function ($query) use ($term) {
                $query->where('action', 'like', $term)
                      ->orWhere('subject_type', 'like', $term)
                      ->orWhere('ip_address', 'like', $term)
                      ->orWhere('route', 'like', $term)
                      ->orWhereHas('actor', fn($sub) => $sub->where('name', 'like', $term))
                      ->orWhereHas('unitOrDepartment', fn($sub) => $sub->where('name', 'like', $term));
            });
        });

    $userActions = (clone $baseQuery)
        ->whereIn('action', [
            'create', 'update', 'delete',
            'form_approved', 'form_rejected',
            'role_changed',
        ])
        ->latest()
        ->paginate(10, ['*'], 'userPage')
        ->withQueryString();

    $securityLogs = (clone $baseQuery)
        ->whereIn('action', [
            'login_success', 'login_failed', 'logout',
        ])
        ->latest()
        ->paginate(10, ['*'], 'securityPage')
        ->withQueryString();

    // ✅ Hydrate IDs into human-friendly names
    $hydrateValues = function ($logs) {
        return $logs->through(function ($log) {
            $old = $log->old_values ?? [];
            $new = $log->new_values ?? [];

            // Unit or Department
            if (isset($old['unit_or_department_id'])) {
                $old['unit_or_department_id'] = optional(\App\Models\UnitOrDepartment::find($old['unit_or_department_id']))->name;
            }
            if (isset($new['unit_or_department_id'])) {
                $new['unit_or_department_id'] = optional(\App\Models\UnitOrDepartment::find($new['unit_or_department_id']))->name;
            }

            // Building
            if (isset($old['building_id'])) {
                $old['building_id'] = optional(\App\Models\Building::find($old['building_id']))->name;
            }
            if (isset($new['building_id'])) {
                $new['building_id'] = optional(\App\Models\Building::find($new['building_id']))->name;
            }

            // Room
            if (isset($old['room_id'])) {
                $old['room_id'] = optional(\App\Models\BuildingRoom::find($old['room_id']))->name;
            }
            if (isset($new['room_id'])) {
                $new['room_id'] = optional(\App\Models\BuildingRoom::find($new['room_id']))->name;
            }

            // Actor (user)
            if (isset($old['actor_id'])) {
                $old['actor_id'] = optional(\App\Models\User::find($old['actor_id']))->name;
            }
            if (isset($new['actor_id'])) {
                $new['actor_id'] = optional(\App\Models\User::find($new['actor_id']))->name;
            }

            // Category
            if (isset($old['category_id'])) {
                $old['category_id'] = optional(\App\Models\Category::find($old['category_id']))->name;
            }
            if (isset($new['category_id'])) {
                $new['category_id'] = optional(\App\Models\Category::find($new['category_id']))->name;
            }

            // Asset Model
            if (isset($old['asset_model_id'])) {
                $old['asset_model_id'] = optional(\App\Models\AssetModel::find($old['asset_model_id']))->brand_model;
            }
            if (isset($new['asset_model_id'])) {
                $new['asset_model_id'] = optional(\App\Models\AssetModel::find($new['asset_model_id']))->brand_model;
            }

            // ✅ Personnel
            if (isset($old['personnel_id'])) {
                $old['personnel_id'] = optional(\App\Models\Personnel::find($old['personnel_id']))->name;
            }
            if (isset($new['personnel_id'])) {
                $new['personnel_id'] = optional(\App\Models\Personnel::find($new['personnel_id']))->name;
            }

            $log->old_values = $old;
            $log->new_values = $new;
            return $log;
        });
    };

    return Inertia::render('audit-trail/index', [
        'title'        => 'Audit Trail',
        'filters'      => $filters,
        'userActions'  => $hydrateValues($userActions),
        'securityLogs' => $hydrateValues($securityLogs),
    ]);
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
    public function show(AuditTrail $auditTrail)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AuditTrail $auditTrail)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AuditTrail $auditTrail)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AuditTrail $auditTrail)
    {
        //
    }
}
