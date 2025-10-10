<?php

namespace App\Http\Controllers;
use Inertia\Inertia;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

use App\Models\InventoryList;
use App\Models\TurnoverDisposal;
use App\Models\UnitOrDepartment;
use App\Models\TurnoverDisposalAsset;
use Illuminate\Support\Facades\DB;

use App\Models\User;
use App\Models\Role;
use App\Models\Personnel;

use App\Models\TurnoverDisposalSignatory;

class TurnoverDisposalController extends Controller
{
    private function indexProps(): array
{
    $assignedBy = Auth::user();

    $pmoHeadRoleId = Role::where('code', 'pmo_head')->value('id');

    $pmoHead = User::where('role_id', $pmoHeadRoleId)
        ->where('status', 'approved')
        ->first();

    $unitOrDepartments = UnitOrDepartment::all();
    $personnels = Personnel::activeForAssignments();

    $turnoverDisposals = TurnoverDisposal::with([
        'turnoverDisposalAssets.assets.assetModel.category',
        'issuingOffice',
        'receivingOffice',
        'turnoverDisposalAssets.assets.building',
        'turnoverDisposalAssets.assets.buildingRoom',
        'turnoverDisposalAssets.assets.subArea',
        'turnoverDisposalAssets.assets.assetModel.equipmentCode',
    ])
    ->withCount('turnoverDisposalAssets as asset_count')
    ->latest()
    ->get();

    $turnoverDisposalAssets = TurnoverDisposalAsset::with([
        'assets.assetModel.category',
    ])
    ->whereHas('turnoverDisposal', function ($q) {
        $q->where('status', '!=', 'disposed');
    })
    ->get();

    $assets = InventoryList::with([
        'assetModel.category',
        'building:id,name',
        'buildingRoom:id,room,building_id',
        'subArea:id,name,building_room_id',
    ])->get();

    // ✅ NEW: load global signatories
    $signatories = TurnoverDisposalSignatory::all()->keyBy('role_key');

    return [
        'turnoverDisposals'      => $turnoverDisposals,
        'turnoverDisposalAssets' => $turnoverDisposalAssets,
        'assets'                 => $assets,
        'unitOrDepartments'      => $unitOrDepartments,
        'assignedBy'             => $assignedBy,
        'pmoHead'                => $pmoHead,
        'personnels'             => $personnels,
        'signatories'            => $signatories, // ✅ include this

        'totals'            => TurnoverDisposal::dashboardTotals(),
    ];
}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('turnover-disposal/index', $this->indexProps());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'issuing_office_id'   => ['required', 'integer', Rule::exists('unit_or_departments', 'id')],
            'type'                => ['required', Rule::in(['turnover', 'disposal'])],
            'receiving_office_id' => ['required', 'integer', Rule::exists('unit_or_departments', 'id')],
            'description'         => ['nullable', 'string'],
            'personnel_in_charge' => ['nullable', 'string'],
            'personnel_id'          => ['required', 'integer', Rule::exists('personnels', 'id')],
            'document_date'       => ['required', 'date'],
            'status'              => ['required', Rule::in(['pending_review', 'approved', 'rejected', 'cancelled', 'completed'])],
            'remarks'             => ['nullable', 'string'],

            'turnover_disposal_assets'                  => ['required', 'array', 'min:1'],
            'turnover_disposal_assets.*.asset_id'       => ['required', 'integer', Rule::exists('inventory_lists', 'id')],
        ]);

        $lines = $validated['turnover_disposal_assets'];
        unset($validated['turnover_disposal_assets']);

        $record = TurnoverDisposal::createWithLines($validated, $lines);
        $recordType = ucfirst($record->type);

        return back()->with('success', "{$recordType} Record #{$record->id} created.");
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TurnoverDisposal $turnoverDisposal)
    {
        $validated = $request->validate([
            'issuing_office_id'   => ['required', 'integer', Rule::exists('unit_or_departments', 'id')],
            'type'                => ['required', Rule::in(['turnover', 'disposal'])],
            'receiving_office_id' => ['required', 'integer', Rule::exists('unit_or_departments', 'id')],
            'description'         => ['nullable', 'string'],
            'personnel_in_charge' => ['nullable', 'string'],
            'personnel_id'          => ['required', 'integer', Rule::exists('personnels', 'id')],
            'document_date'       => ['required', 'date'],
            'status'              => ['required', Rule::in(['pending_review', 'approved', 'rejected', 'cancelled', 'completed'])],
            'remarks'             => ['nullable', 'string'],

            'turnover_disposal_assets'                  => ['required', 'array', 'min:1'],
            'turnover_disposal_assets.*.asset_id'       => ['required', 'integer', Rule::exists('inventory_lists', 'id')],
        ]);

        $lines = $validated['turnover_disposal_assets'];
        unset($validated['turnover_disposal_assets']);

        $record = $turnoverDisposal->updateWithLines($validated, $lines);

        return back()->with('success', "Record #{$record->id} has been updated.");
    }


    public function show(TurnoverDisposal $turnoverDisposal)
    {
        $turnoverDisposal->load([
            'issuingOffice',
            'receivingOffice',
            'turnoverDisposalAssets.assets.assetModel.category',
            'turnoverDisposalAssets.assets.building',
            'turnoverDisposalAssets.assets.buildingRoom',
            'turnoverDisposalAssets.assets.subArea',
           'formApproval.steps' => fn($q) =>
                $q->whereIn('code', ['external_noted_by','noted_by'])
                ->whereIn('status', ['pending', 'approved', 'rejected'])
                ->orderByDesc('acted_at'),
            'formApproval.steps.actor:id,name',

            'turnoverDisposalAssets.assets.assetModel.equipmentCode',
            'personnel',
        ]);

        $turnoverDisposal->append([
            'noted_by_name',
            'noted_by_title'
        ]);

        return Inertia::render('turnover-disposal/index', array_merge(
            $this->indexProps(),                 
            ['viewing' => $turnoverDisposal],
        ));
    }

    public function destroy(TurnoverDisposal $turnoverDisposal)
    {
        DB::transaction(function () use ($turnoverDisposal) {
            // $turnoverDisposal->softDeleteRelatedAssets(); REMOVED TO RESTORE LINK BACK WHEN RESTORED IN TRASH BIN
            $turnoverDisposal->delete();
        });

        return redirect()->route('turnover-disposal.index')->with('success', "Record deleted successfully");
    }

    public function restore(int $id)
    {
        $record = TurnoverDisposal::withTrashed()->findOrFail($id);
        $record->restore();
        return back()->with('success', 'Turnover/Disposal record restored successfully.');
    }

    private function fetchPmoHead(): ?array
    {
        $roleId = Role::where('code', 'pmo_head')->value('id'); // respects SoftDeletes
        if (!$roleId) return null;

        $u = User::select('id', 'name') // keep payload minimal
            ->where('role_id', $roleId)             // no joins/whereHas
            ->first();

        return $u?->only(['id', 'name']);            // avoid hidden/serialization surprises
    }

    public function exportPdf(int $id)
    {
        $turnoverDisposal = TurnoverDisposal::with([
            'issuingOffice',
            'receivingOffice',
            'personnel',
            'turnoverDisposalAssets.assets',
        ])->findOrFail($id);

        $assets = $turnoverDisposal->turnoverDisposalAssets->map(fn($t) => $t->assets)->filter();

        $signatories = TurnoverDisposalSignatory::all()->keyBy('role_key');

        $pdf = Pdf::loadView('forms.turnover_disposal_form_pdf', [
            'turnoverDisposal' => $turnoverDisposal,
            'assets' => $assets,
            'signatories' => $signatories,
        ])->setPaper('A4', 'portrait')
            ->setOption('isPhpEnabled', true);

        $timestamp = now()->format('Y-m-d');

        return $pdf->download("Turnover-Disposal-Form-{$turnoverDisposal->id}-{$timestamp}.pdf");
        // return $pdf->stream("Turnover-Disposal-Form-{$turnoverDisposal->id}-{$timestamp}.pdf");
    }
}
