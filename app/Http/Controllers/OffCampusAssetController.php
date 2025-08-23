<?php

namespace App\Http\Controllers;

use App\Models\OffCampus;
use App\Models\OffCampusAsset;
use App\Models\AssetModel;
use App\Models\UnitOrDepartment;
use App\Models\InventoryList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OffCampusAssetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
        // header fields...
        'requester_name'      => ['required','string','max:255'],
        'college_or_unit_id'  => ['nullable','exists:unit_or_departments,id'],
        'purpose'             => ['required','string'],
        'date_issued'         => ['required','date'],
        'return_date'         => ['nullable','date','after_or_equal:date_issued'],
        'remarks'             => ['required','in:official_use,repair'],
        'approved_by'         => ['nullable','string','max:255'],
        'issued_by_id'        => ['nullable','exists:users,id'],
        'checked_by'          => ['nullable','string','max:255'],
        'comments'            => ['nullable','string'],

        // asset lines
        'selected_assets'                       => ['required','array','min:1'],
        'selected_assets.*.asset_id'            => ['nullable','exists:inventory_lists,id'],
        'selected_assets.*.asset_model_id'      => ['nullable','exists:asset_models,id'],
        'selected_assets.*.quantity'            => ['required','integer','min:1'],
        'selected_assets.*.units'               => ['required','string','max:50'],
        'selected_assets.*.comments'            => ['nullable','string'],
    ]);

        DB::transaction(function () use ($data) {
            $off = OffCampus::create(collect($data)->except('assets')->toArray());
            foreach ($data['selected_assets'] as $row) {
                $off->assets()->create($row);
            }
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(OffCampusAsset $offCampusAsset)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(OffCampusAsset $offCampusAsset)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, OffCampusAsset $offCampusAsset)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OffCampusAsset $offCampusAsset)
    {
        //
    }
}
