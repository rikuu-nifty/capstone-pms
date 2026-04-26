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

use App\Support\SignatorySnapshot;

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

        'formApproval',
        'formApproval.steps' => fn($q) => $q
            ->whereIn('code', ['prepared_by', 'external_noted_by', 'noted_by'])
            ->whereIn('status', ['pending', 'approved', 'rejected', 'skipped'])
            ->orderBy('step_order'),
        'formApproval.steps.actor:id,name',
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

        $signatories = SignatorySnapshot::live('turnover_disposal');

        return [
            'turnoverDisposals'      => $turnoverDisposals,
            'turnoverDisposalAssets' => $turnoverDisposalAssets,
            'assets'                 => $assets,
            'unitOrDepartments'      => $unitOrDepartments,
            'assignedBy'             => $assignedBy,
            'pmoHead'                => $pmoHead,
            'personnels'             => $personnels,
            'signatories'            => $signatories,

            'totals'            => TurnoverDisposal::dashboardTotals(),
        ];
    }

    public function index()
    {
        return Inertia::render('turnover-disposal/index', $this->indexProps());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'issuing_office_id'         => ['required', 'integer', Rule::exists('unit_or_departments', 'id')],
            'type'                      => ['required', Rule::in(['turnover', 'disposal'])],
            'turnover_category'         => ['nullable', Rule::in(['sharps', 'breakages', 'chemical', 'hazardous', 'non_hazardous'])],

            'receiving_office_id'       => ['nullable', 'integer', Rule::exists('unit_or_departments', 'id')],
            // 'external_recipient'        => ['nullable', 'string', 'max:255'],
            'external_recipient'  => [
                Rule::requiredIf(fn() => $request->boolean('is_donation') && !$request->input('receiving_office_id')),
                'nullable',
                'string'
            ],

            'description'               => ['nullable', 'string'],
            'personnel_in_charge'       => ['nullable', 'string'],
            'personnel_id'              => ['required', 'integer', Rule::exists('personnels', 'id')],
            'document_date'             => ['required', 'date'],
            'status'                    => ['required', Rule::in(['pending_review', 'approved', 'rejected', 'cancelled', 'completed'])],
            'remarks'                   => ['nullable', 'string'],
            'is_donation'               => ['boolean'],

            'turnover_disposal_assets'              => ['required', 'array', 'min:1'],
            'turnover_disposal_assets.*.asset_id'   => ['required', 'integer', Rule::exists('inventory_lists', 'id')],
            'turnover_disposal_assets.*.remarks'    => ['nullable', 'string'],
        ]);

        if (
            ($validated['is_donation'] ?? false) &&
            empty($validated['receiving_office_id']) &&
            empty($validated['external_recipient'])
        ) {
            return back()
                ->withErrors(['external_recipient' => 'Please specify either a receiving office or an external recipient for this donation.'])
                ->withInput();
        }

        $lines = $validated['turnover_disposal_assets'];
        unset($validated['turnover_disposal_assets']);
        $validated['signatories_snapshot'] = SignatorySnapshot::capture('turnover_disposal');

        // Prevent duplicate active turnover/disposal forms for same assets
        $assetIds = collect($lines)->pluck('asset_id')->unique();

        $duplicateExists = TurnoverDisposal::query()
            ->whereNull('deleted_at')
            ->whereNotIn('status', ['rejected', 'cancelled', 'completed']) // active only
            ->whereHas('turnoverDisposalAssets', function ($q) use ($assetIds) {
                $q->whereIn('asset_id', $assetIds);
            })
            ->exists();

        if ($duplicateExists) {
            return back()->withErrors([
                'turnover_disposal_assets' => 'One or more selected assets already belong to an active turnover/disposal record. 
        Please complete, cancel, or reject the existing record before creating a new one.'
            ]);
        }

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
            'issuing_office_id'         => ['required', 'integer', Rule::exists('unit_or_departments', 'id')],
            'type'                      => ['required', Rule::in(['turnover', 'disposal'])],
            'turnover_category'         => ['nullable', Rule::in(['sharps', 'breakages', 'chemical', 'hazardous', 'non_hazardous'])],

            'receiving_office_id'       => ['nullable', 'integer', Rule::exists('unit_or_departments', 'id')],
            'external_recipient'        => ['nullable', 'string', 'max:255'],

            'description'               => ['nullable', 'string'],
            'personnel_in_charge'       => ['nullable', 'string'],
            'personnel_id'              => ['required', 'integer', Rule::exists('personnels', 'id')],
            'document_date'             => ['required', 'date'],
            'status'                    => ['required', Rule::in(['pending_review', 'approved', 'rejected', 'cancelled', 'completed'])],
            'remarks'                   => ['nullable', 'string'],
            'is_donation'               => ['boolean'],

            'turnover_disposal_assets'              => ['required', 'array', 'min:1'],
            'turnover_disposal_assets.*.asset_id'   => ['required', 'integer', Rule::exists('inventory_lists', 'id')],
            'turnover_disposal_assets.*.remarks'    => ['nullable', 'string'],
        ]);

        if (
            ($validated['is_donation'] ?? false) &&
            empty($validated['receiving_office_id']) &&
            empty($validated['external_recipient'])
        ) {
            return back()
                ->withErrors(['external_recipient' => 'Please specify either a receiving office or an external recipient for this donation.'])
                ->withInput();
        }

        $turnoverDisposal->load('formApproval');

        $canEditFinalStatus = $turnoverDisposal->formApproval?->status === 'approved';

        if (!$canEditFinalStatus) {
            if (($validated['status'] ?? null) !== $turnoverDisposal->status) {
                return back()
                    ->withErrors([
                        'status' => 'Status cannot be changed until both Dean/Head and PMO Head approvals are completed.'
                    ])
                    ->withInput();
            }
        } else {
            if (!in_array($validated['status'], ['completed', 'cancelled'], true)) {
                return back()
                    ->withErrors([
                        'status' => 'Once all approvals are completed, only Completed or Cancelled can be selected.'
                    ])
                    ->withInput();
            }
        }

        $lines = $validated['turnover_disposal_assets'];
        unset($validated['turnover_disposal_assets']);

        $assetIds = collect($lines)->pluck('asset_id')->unique();

        $duplicateExists = TurnoverDisposal::query()
            ->where('id', '!=', $turnoverDisposal->id)
            ->whereNull('deleted_at')
            ->whereNotIn('status', ['rejected', 'cancelled', 'completed'])
            ->whereHas('turnoverDisposalAssets', function ($q) use ($assetIds) {
                $q->whereIn('asset_id', $assetIds);
            })
            ->exists();

        if ($duplicateExists) {
            return back()->withErrors([
                'turnover_disposal_assets' => 'One or more selected assets already belong to another active turnover/disposal record. 
    Please complete, cancel, or reject the existing record before updating this one.'
            ]);
        }

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
            'formApproval',
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
            [
                'viewing' => $turnoverDisposal,
                'signatories' => SignatorySnapshot::forForm($turnoverDisposal->signatories_snapshot, 'turnover_disposal'),
            ],
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

        // Build assets with remarks
        $assets = $turnoverDisposal->turnoverDisposalAssets->map(function ($t) use ($turnoverDisposal) {
            $asset = $t->assets;
            if ($asset) {
                $asset->pivot_remarks = $t->remarks;
                $asset->record_remarks = $turnoverDisposal->remarks;
            }
            return $asset;
        })->filter();

        // Load DB signatories
        $signatories = SignatorySnapshot::forForm($turnoverDisposal->signatories_snapshot, 'turnover_disposal');

        // Inject "Head / Unit" dynamically (if not in DB)
        $signatories->put('head_unit', [
            'name'  => $turnoverDisposal->issuingOffice->unit_head ?? '—',
            'title' => 'Head / Unit',
        ]);

        $pdf = Pdf::loadView('forms.turnover_disposal_form_pdf', [
            'turnoverDisposal' => $turnoverDisposal,
            'assets' => $assets,
            'signatories' => $signatories,
        ])->setPaper('A4', 'portrait')
        ->setOption('isPhpEnabled', true);

        $timestamp = now()->format('Y-m-d');

        return $pdf->download("Turnover-Disposal-Form-{$turnoverDisposal->id}-{$timestamp}.pdf");
    }

}
