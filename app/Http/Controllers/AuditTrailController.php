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
    public function index(Request $request): \Inertia\Response
{
    $query = AuditTrail::query()
        ->with('actor', 'unitOrDepartment')
        ->when($request->from, fn($q) => $q->whereDate('created_at', '>=', $request->from))
        ->when($request->to, fn($q) => $q->whereDate('created_at', '<=', $request->to))
        ->when($request->actor_id, fn($q) => $q->where('actor_id', $request->actor_id))
        ->when($request->action, fn($q) => $q->where('action', $request->action))
        ->when($request->subject_type, fn($q) => $q->where('subject_type', $request->subject_type))
        ->latest();

    return Inertia::render('audit-trail/index', [
        'title'   => 'Audit Trail',
        'filters' => $request->only(['from','to','actor_id','action','subject_type']),
        'logs'    => $query->paginate(20)->withQueryString(),
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
