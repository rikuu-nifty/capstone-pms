<?php

namespace App\Http\Controllers;

use App\Models\VerificationForm;
use App\Models\UnitOrDepartment;
use App\Models\Personnel;
use App\Models\User;
use App\Models\Role;
use App\Models\InventoryList;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class VerificationFormController extends Controller
{
    private function indexProps(): array
    {
        $assets = InventoryList::select(
            'id',
            'asset_name',
            'serial_no',
            'unit_cost',
            'supplier',
            'date_purchased',
            'unit_or_department_id',
            'building_id',
            'building_room_id',
            'sub_area_id',
        )
        ->with([
            'building:id,name',
            'buildingRoom:id,room',
            'subArea:id,name',
        ])
        ->get();
        $unitOrDepartments = UnitOrDepartment::select('id', 'name', 'code')->orderBy('name')->get();
        $personnels = Personnel::activeForAssignments();
        $pmoHeadRoleId = Role::where('code', 'pmo_head')->value('id');
        $user = Auth::user();
        $pmoHead = $pmoHeadRoleId
            ? User::select('id', 'name')->where('role_id', $pmoHeadRoleId)->first()
            : null;

        return [
            'verifications'      => VerificationForm::fetchPaginated(),
            'totals'             => VerificationForm::summaryTotals(),
            'unitOrDepartments'  => $unitOrDepartments,
            'personnels'         => $personnels,
            'currentUser'        => $user ? ['id' => $user->id, 'name' => $user->name] : null,
            'pmoHead'            => $pmoHead ? ['id' => $pmoHead->id, 'name' => $pmoHead->name] : null,
            'assets'             => $assets,
        ];
    }

    public function index()
    {
        return Inertia::render('verification-form/index', $this->indexProps());
    }

    public function show(int $id)
    {
        $verification = VerificationForm::with([
            'unitOrDepartment',
            'requestedByPersonnel',
            'verifiedBy',
            'verificationAssets.inventoryList' => function ($q) {
                $q->select('id', 'asset_name', 'serial_no', 'supplier', 'unit_cost', 'date_purchased');
            },
        ])->findOrFail($id);

        return Inertia::render('verification-form/index', array_merge(
            $this->indexProps(),
            [
                'viewing' => [
                    'id'                     => $verification->id,
                    'unit_or_department'     => $verification->unitOrDepartment?->only(['id', 'name', 'code']),
                    'requested_by_personnel' => $verification->requestedByPersonnel ? [
                        'id'    => $verification->requestedByPersonnel->id,
                        'name'  => trim($verification->requestedByPersonnel->first_name . ' ' .
                            ($verification->requestedByPersonnel->middle_name ? ($verification->requestedByPersonnel->middle_name . ' ') : '') .
                            $verification->requestedByPersonnel->last_name),
                        'title' => $verification->requestedByPersonnel->position,
                    ] : null,
                    'requested_by_snapshot'  => [
                        'name'    => $verification->requested_by_name,
                        'title'   => $verification->requested_by_title,
                        'contact' => $verification->requested_by_contact,
                    ],
                    'status'      => $verification->status,
                    'notes'       => $verification->notes,
                    'remarks'     => $verification->remarks,
                    'verified_at' => $verification->verified_at,
                    'verified_by' => $verification->verifiedBy?->only(['id', 'name']),
                    'created_at'  => $verification->created_at,

                    'verification_assets' => $verification->verificationAssets->map(fn($va) => [
                        'id'      => $va->id,
                        'remarks' => $va->remarks,
                        'asset'   => [
                            'id'             => $va->inventoryList->id,
                            'asset_name'     => $va->inventoryList->asset_name,
                            'serial_no'      => $va->inventoryList->serial_no,
                            'supplier'       => $va->inventoryList->supplier,
                            'unit_cost'      => $va->inventoryList->unit_cost,
                            'date_purchased' => optional($va->inventoryList->date_purchased)->format('Y-m-d'),
                            'quantity'       => 1,
                        ],
                    ])->values(),
                ],
            ],
        ));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_or_department_id'     => ['required', 'integer', Rule::exists('unit_or_departments', 'id')],
            'requested_by_personnel_id' => ['nullable', 'integer', Rule::exists('personnels', 'id')],
            'requested_by_name'         => ['nullable', 'string', 'max:255'],
            'requested_by_title'        => ['nullable', 'string', 'max:255'],
            'requested_by_contact'      => ['nullable', 'string', 'max:255'],

            'notes'   => ['nullable', 'string'],
            'status'  => ['required', Rule::in(['pending', 'verified', 'rejected'])],
            'remarks' => ['nullable', 'string'],

            'verification_assets'                        => ['array'],
            'verification_assets.*.inventory_list_id'    => ['required', 'integer', 'exists:inventory_lists,id'],
            'verification_assets.*.remarks'              => ['nullable', 'string', 'max:1000'],
        ]);

        // If a personnel is chosen, ensure they belong to the office
        if (!empty($validated['requested_by_personnel_id'])) {
            $belongs = Personnel::where('id', $validated['requested_by_personnel_id'])
                ->where('unit_or_department_id', $validated['unit_or_department_id'])
                ->exists();

            if (!$belongs) {
                return back()
                    ->withErrors(['requested_by_personnel_id' => 'Selected personnel is not under the specified unit/department.'])
                    ->withInput();
            }

            // Auto-fill snapshots when missing
            $p = Personnel::select('first_name', 'middle_name', 'last_name', 'position')
                ->find($validated['requested_by_personnel_id']);

            if ($p) {
                $full = trim($p->first_name . ' ' . ($p->middle_name ? ($p->middle_name . ' ') : '') . $p->last_name);
                $validated['requested_by_name']  = $validated['requested_by_name']  ?: $full;
                $validated['requested_by_title'] = $validated['requested_by_title'] ?: ($p->position ?: 'Staff');
            }
        }

        // Auto-set verifier if creating already-verified
        if ($validated['status'] === 'verified') {
            $validated['verified_by_id'] = Auth::id();
            $validated['verified_at']    = now()->toDateString();
        }

        $form = VerificationForm::create($validated);

        // Limit assets to the chosen unit
        if (!empty($validated['verification_assets'])) {
            $allowedIds = InventoryList::where('unit_or_department_id', $validated['unit_or_department_id'])
                ->pluck('id')->all();

            $rows = [];
            foreach ($validated['verification_assets'] as $row) {
                if (!in_array($row['inventory_list_id'], $allowedIds, true)) {
                    return back()
                        ->withErrors(['verification_assets' => 'One or more assets do not belong to the selected Unit/Department.'])
                        ->withInput();
                }
                $rows[] = [
                    'inventory_list_id' => $row['inventory_list_id'],
                    'remarks'           => $row['remarks'] ?? null,
                ];
            }
            $form->verificationAssets()->createMany($rows);
        }

        return back()->with('success', "Verification Form #{$form->id} created.");
    }

    public function update(Request $request, int $id)
    {
        $verification = VerificationForm::findOrFail($id);

        $validated = $request->validate([
            'unit_or_department_id'     => ['required', 'integer', Rule::exists('unit_or_departments', 'id')],
            'requested_by_personnel_id' => ['nullable', 'integer', Rule::exists('personnels', 'id')],
            'requested_by_name'         => ['nullable', 'string', 'max:255'],
            'requested_by_title'        => ['nullable', 'string', 'max:255'],
            'requested_by_contact'      => ['nullable', 'string', 'max:255'],

            'notes'   => ['nullable', 'string'],
            'status'  => ['required', Rule::in(['pending', 'verified', 'rejected'])],
            'remarks' => ['nullable', 'string'],

            'verification_assets'                        => ['array'],
            'verification_assets.*.inventory_list_id'    => ['required', 'integer', 'exists:inventory_lists,id'],
            'verification_assets.*.remarks'              => ['nullable', 'string', 'max:1000'],
        ]);

        if (!empty($validated['requested_by_personnel_id'])) {
            $belongs = Personnel::where('id', $validated['requested_by_personnel_id'])
                ->where('unit_or_department_id', $validated['unit_or_department_id'])
                ->exists();

            if (!$belongs) {
                return back()
                    ->withErrors(['requested_by_personnel_id' => 'Selected personnel is not under the specified unit/department.'])
                    ->withInput();
            }

            $p = Personnel::select('first_name', 'middle_name', 'last_name', 'position')
                ->find($validated['requested_by_personnel_id']);

            if ($p) {
                $full = trim($p->first_name . ' ' . ($p->middle_name ? ($p->middle_name . ' ') : '') . $p->last_name);
                $validated['requested_by_name']  = $validated['requested_by_name']  ?: $full;
                $validated['requested_by_title'] = $validated['requested_by_title'] ?: ($p->position ?: 'Staff');
            }
        }

        if ($verification->status !== 'verified' && $validated['status'] === 'verified') {
            $validated['verified_by_id'] = Auth::id();
            $validated['verified_at']    = now()->toDateString();
        }

        $verification->update($validated);

        $allowedIds = InventoryList::where('unit_or_department_id', $validated['unit_or_department_id'])
            ->pluck('id')->all();

        $rows = [];
        foreach ($validated['verification_assets'] ?? [] as $row) {
            if (!in_array($row['inventory_list_id'], $allowedIds, true)) {
                return back()
                    ->withErrors(['verification_assets' => 'One or more assets do not belong to the selected Unit/Department.'])
                    ->withInput();
            }
            $rows[] = [
                'inventory_list_id' => $row['inventory_list_id'],
                'remarks'           => $row['remarks'] ?? null,
            ];
        }

        $verification->verificationAssets()->delete();
        if ($rows) {
            $verification->verificationAssets()->createMany($rows);
        }

        return back()->with('success', "Verification Form #{$verification->id} updated.");
    }

    public function destroy(int $id)
    {
        $verification = VerificationForm::findOrFail($id);
        $verification->delete();

        return redirect()->route('verification-form.index')
            ->with('success', 'Verification Form deleted successfully.');
    }

    public function verify(Request $request, int $id)
    {
        $verification = VerificationForm::findOrFail($id);

        $verification->update([
            'status'         => 'verified',
            'verified_by_id' => Auth::id(),
            'verified_at'    => now()->toDateString(),
            'notes'          => $request->input('notes'),
            'remarks'        => $request->input('remarks'),
        ]);

        return back()->with('success', "Verification Form #{$verification->id} verified successfully.");
    }

    public function reject(Request $request, int $id)
    {
        $request->validate([
            'notes'   => ['nullable', 'string', 'max:1000'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        $verification = VerificationForm::findOrFail($id);

        $verification->update([
            'status'         => 'rejected',
            'verified_by_id' => Auth::id(),
            'verified_at'    => now()->toDateString(),
            'notes'          => $request->input('notes'),
            'remarks'        => $request->input('remarks'),
        ]);

        return back()->with('success', "Verification Form #{$verification->id} has been rejected.");
    }

    public function exportPdf(int $id)
    {
        $verification = VerificationForm::with([
            'unitOrDepartment',
            'requestedByPersonnel',
            'verifiedBy',
            'verificationAssets.inventoryList' => function ($q) {
                $q->select('id', 'asset_name', 'serial_no', 'supplier', 'unit_cost', 'date_purchased');
            },
        ])->findOrFail($id);

        $pmoHeadRoleId = Role::where('code', 'pmo_head')->value('id');
        $pmoHead = $pmoHeadRoleId
            ? User::select('id', 'name')->where('role_id', $pmoHeadRoleId)->first()
            : null;

        $pdf = Pdf::loadView('forms.verification-form', [
            'verification' => $verification,
            'pmo_head'     => $pmoHead?->only(['id', 'name']),
            'todayDate'    => now()->format('n/j/Y'),
        ])
        ->setPaper('A4', 'portrait');

        return $pdf->stream("Verification_Form_{$verification->id}.pdf");
        // return $pdf->download("Verification_Form_{$verification->id}.pdf");
    }
}
