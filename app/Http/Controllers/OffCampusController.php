<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use App\Models\OffCampus;
use App\Models\OffCampusAsset;
use App\Models\AssetModel;
use App\Models\UnitOrDepartment;
use App\Models\User;
use App\Models\InventoryList;
use App\Models\OffCampusSignatory;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class OffCampusController extends Controller
{
    /**
     * Display a listing of the resource.
     */
   public function index(Request $request)
    {
        // Accept ?status=active|archived|all
        $status = $request->string('status')->toString();

        $rows = OffCampus::query()
            ->when($status === 'archived', fn ($q) => $q->onlyTrashed())
            ->when($status === 'all', fn ($q) => $q->withTrashed())
            ->with([
                'assets' => function ($q) {
        $q->select('id','off_campus_id','asset_id','asset_model_id') 
        ->with([
            'asset:id,asset_model_id,asset_name,description,serial_no,unit_or_department_id',
            'asset.assetModel:id,brand,model',
        ]);
    },
                'collegeOrUnit:id,name,code',
                'issuedBy:id,name',
            ])
            ->latest('id') //  still ordered latest first
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('off-campus/index', [
            'offCampuses'        => $rows,
            'filters'            => ['status' => $status ?: 'active'],
            'unitOrDepartments'  => UnitOrDepartment::select('id','name','code')->orderBy('name')->get(),
            'assets'             => InventoryList::select('id','asset_model_id','asset_name','serial_no','unit_or_department_id')->orderBy('asset_name')->get(),
            'assetModels'        => AssetModel::select('id','brand','model')->orderBy('brand')->orderBy('model')->get(),
            'users'              => User::select('id','name')->orderBy('name')->get(),
            'signatories'        => OffCampusSignatory::all()->keyBy('role_key'),

            'totals'            => OffCampus::dashboardTotals(),
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
        $data = $request->validate([
            'requester_name'      => ['required','string','max:255'],
            'college_or_unit_id'  => ['nullable','exists:unit_or_departments,id'],
            'purpose'             => ['required','string'],
            'date_issued'         => ['required','date'],
            'status'             => ['nullable', Rule::in(['pending_review', 'pending_return', 'returned', 'overdue', 'cancelled', 'missing'])],
            'return_date'         => ['nullable','date','after_or_equal:date_issued'],
            'quantity'            => ['required','integer','min:1'],
            'units'               => ['required','string','max:50'],
            // 'asset_id'            => ['nullable','exists:inventory_lists,id'],
            //  'asset_model_id'      => ['nullable','exists:asset_models,id'],
            'comments'            => ['nullable','string'],
            'remarks'             => ['required','in:official_use,repair'],
            'approved_by'         => ['nullable','string','max:255'],
            'issued_by_id'        => ['nullable','exists:users,id'],
            'checked_by'          => ['nullable','string','max:255'],

            // Child Rows
            'selected_assets'                  => ['required','array','min:1'],
            'selected_assets.*.asset_id'       => ['required','exists:inventory_lists,id'],
            'selected_assets.*.asset_model_id' => ['nullable','exists:asset_models,id'],
        ]);

        $data['status'] = $data['status'] ?? 'pending_review';

        DB::transaction(function () use ($data) {
            $offCampus = OffCampus::create(collect($data)->except('selected_assets')->toArray());

            foreach ($data['selected_assets'] as $row) {
                $offCampus->assets()->create([
                    'asset_id'       => $row['asset_id'],
                    'asset_model_id' => $row['asset_model_id'] ?? null,
                    'quantity'       => 1,
                    'units'          => $data['units'] ?? 'pcs',
                    'comments'       => $data['comments'] ?? null,
                ]);
            }
        });

        return redirect()->route('off-campus.index')->with('success', 'Off-campus record created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $offCampuses       = OffCampus::with([
            'assets.asset:id,asset_model_id,asset_name,description,serial_no',
            'assets.asset.assetModel:id,brand,model',
            'collegeOrUnit:id,name,code',
            'issuedBy:id,name',
        ])
        ->latest()
        ->paginate(20);

        $unitOrDepartments = UnitOrDepartment::select('id','name','code')->orderBy('name')->get();
        $assets            = InventoryList::select('id','asset_model_id','asset_name','serial_no', 'unit_or_department_id',)->orderBy('asset_name')->get();
        $assetModels       = AssetModel::select('id','brand','model')->orderBy('brand')->orderBy('model')->get();
        $users             = User::select('id','name')->orderBy('name')->get();

        $viewing = OffCampus::findForView($id);

        $pmoHead = User::whereHas('role', fn($q) => $q->where('code', 'pmo_head'))
            ->where('status', 'approved')
            ->first();

        $signatories = OffCampusSignatory::all()->keyBy('role_key');

        return Inertia::render('off-campus/index', [
            'offCampuses'       => $offCampuses,
            'unitOrDepartments' => $unitOrDepartments,
            'assets'            => $assets,
            'assetModels'       => $assetModels,
            'users'             => $users,

            'viewing'           => $viewing,
            
            'signatories'       => $signatories,
            'pmoHead'           => $pmoHead ? [
                'id'   => $pmoHead->id,
                'name' => $pmoHead->name,
            ] : null,
            'totals' => OffCampus::dashboardTotals(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(OffCampus $offCampus)
{
    $offCampus->load([
        'assets.asset:id,asset_model_id,asset_name,description,serial_no,unit_or_department_id',
        'assets.asset.assetModel:id,brand,model',
        'collegeOrUnit:id,name,code',
        'issuedBy:id,name',
    ]);

    return Inertia::render('off-campus/edit', [
        'offCampus'          => $offCampus,
        'unitOrDepartments'  => UnitOrDepartment::select('id','name','code')->orderBy('name')->get(),
        'assets'             => InventoryList::select('id','asset_model_id','asset_name','serial_no', 'unit_or_department_id')->orderBy('asset_name')->get(),
        'assetModels'        => AssetModel::select('id','brand','model')->orderBy('brand')->orderBy('model')->get(),
        'users'              => User::select('id','name')->orderBy('name')->get(),
    ]);
}

    // public function edit(OffCampus $offCampus)
    // {
    //     $offCampus = OffCampus::with([
    //     'assets.asset:id,asset_model_id,asset_name,description,serial_no',
    //     'assets.asset.assetModel:id,brand,model',
    //     'collegeOrUnit:id,name,code',
    //     'issuedBy:id,name', 
    // ])->findOrFail($id);

    // return Inertia::render('off-campus/edit', [
    //     'offCampus' => $offCampus,
    //     'unitOrDepartments' => UnitOrDepartment::select('id','name','code')->orderBy('name')->get(),
    //     'assets' => InventoryList::select('id','asset_model_id','asset_name','serial_no')->get(),
    //     'assetModels' => AssetModel::select('id','brand','model')->get(),
    //     'users' => User::select('id','name')->get(),
    // ]);
    // }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, OffCampus $offCampus)
    {
        $data = $request->validate([
            'requester_name'      => ['required','string','max:255'],
            'college_or_unit_id'  => ['nullable','exists:unit_or_departments,id'],
            'purpose'             => ['required','string'],
            'date_issued'         => ['required','date'],
            'status'              => ['nullable', Rule::in(['pending_review', 'pending_return', 'returned', 'overdue', 'cancelled', 'missing'])],
            'return_date'         => ['nullable','date','after_or_equal:date_issued'],
            'quantity'            => ['required','integer','min:1'],

            'units'               => ['required','string','max:50'],
            'comments'            => ['nullable','string'],
            'remarks'             => ['required','in:official_use,repair'],
            'approved_by'         => ['nullable','string','max:255'],
            'issued_by_id'        => ['nullable','exists:users,id'],
            'checked_by'          => ['nullable','string','max:255'],

            // child rows with custom rule inline
            'selected_assets' => [
                'required',
                'array',
                'min:1',
                function ($attr, $value, $fail) use ($request) {
                    if (count($value) !== (int) $request->quantity) {
                        $fail("You set the quantity to {$request->quantity} but selected " . count($value) . " assets.");
                    }
                },
            ],
            'selected_assets.*.asset_id'       => ['required','exists:inventory_lists,id'],
            'selected_assets.*.asset_model_id' => ['nullable','exists:asset_models,id'],
        ]);

        $data['status'] = $data['status'] ?? 'pending_review';

        DB::transaction(function () use ($offCampus, $data) {
            //  update parent first
            $offCampus->update(collect($data)->except('selected_assets')->toArray());

            //  clear old children
            $offCampus->assets()->delete();

            //  re-insert new children
            foreach ($data['selected_assets'] as $row) {
                $offCampus->assets()->create([
                    'asset_id'       => $row['asset_id'],
                    'asset_model_id' => $row['asset_model_id'] ?? null,
                    'quantity'       => 1,
                    'units'          => $data['units'] ?? 'pcs',
                    'comments'       => $data['comments'] ?? null,
                ]);
            }

            // if status is "missing", archive all related assets in inventory_lists
            if ($data['status'] === 'missing') {
                $assetIds = collect($data['selected_assets'])->pluck('asset_id')->toArray();

                if (!empty($assetIds)) {
                    // Fetch existing descriptions so we can append
                    $assets = InventoryList::whereIn('id', $assetIds)->get();

                    foreach ($assets as $asset) {
                        $note = "\n\n[Marked Missing under Off-Campus #{$offCampus->id} on " . now()->format('M d, Y') . "]";
                        $newDescription = trim(($asset->description ?? '') . $note);

                        $asset->update([
                            'status'      => 'archived',
                            'description' => $newDescription,
                        ]);
                    }
                }
            } else {
                //  If record is no longer "missing", restore any previously archived assets
                $assetIds = collect($data['selected_assets'])->pluck('asset_id')->toArray();

                if (!empty($assetIds)) {
                    $assets = InventoryList::whereIn('id', $assetIds)
                        ->where('status', 'archived')
                        ->get();

                    foreach ($assets as $asset) {
                        $description = $asset->description ?? '';

                        // 🧹 Remove any previous "[Marked Missing ...]" note
                        $cleanedDescription = preg_replace(
                            '/\n*\[Marked Missing under Off-Campus #[0-9]+ on [A-Za-z]{3} [0-9]{1,2}, [0-9]{4}\]/',
                            '',
                            $description
                        );

                        $asset->update([
                            'status'      => 'active',
                            'description' => trim($cleanedDescription),
                        ]);
                    }
                }
            }
        });

        return redirect()->route('off-campus.index')->with('success', 'Off-campus record updated successfully.');
    }

    public function destroy(Request $request, OffCampus $offCampus)
    {
        // Track who archived it (requires nullable off_campuses.deleted_by column)
        $offCampus->forceFill(['deleted_by_id' => $request->user()->id ?? null])->save();

        // Archive parent (children are archived in model events)
        $offCampus->delete();

        return back()->with('success', 'Off-campus request archived.');
    }

    public function restore(int $id)
    {
        $offCampus = OffCampus::withTrashed()->findOrFail($id);
        $offCampus->restore();
        return back()->with('success', 'Off-campus request restored.');
    }

    public function forceDelete(int $id)
    {
        $offCampus = OffCampus::withTrashed()->findOrFail($id);

        // If you truly want to purge the record and its children:
        $offCampus->assets()->withTrashed()->forceDelete();
        $offCampus->forceDelete();

        return back()->with('success', 'Off-campus request permanently removed.');
    }

    public function exportPdf(int $id)
    {
        $offCampus = OffCampus::with([
            'assets.asset:id,asset_model_id,asset_name,description,serial_no',
            'assets.asset.assetModel:id,brand,model',
            'collegeOrUnit:id,name,code',
            'issuedBy:id,name',
        ])->findOrFail($id);

        $assets = $offCampus->assets->map(fn($a) => $a->asset)->filter();
        $pmoHead = User::whereHas('role', fn($q) => $q->where('code', 'pmo_head'))
            ->where('status', 'approved')
            ->first();

        $signatories = OffCampusSignatory::all()->keyBy('role_key');
        $signatories['issued_by'] = (object) [
            'name'  => $pmoHead?->name ?? '—',
            'title' => 'Head, PMO',
        ];

        $pdf = Pdf::loadView('forms.off_campus_form_pdf', [
            'offCampus' => $offCampus,
            'assets' => $assets,
            'signatories' => $signatories,
        ])->setPaper('A4', 'portrait')
            ->setOption('isPhpEnabled', true);

        $timestamp = now()->format('Y-m-d');

        return $pdf->stream("Off-Campus-Form-{$offCampus->id}-{$timestamp}.pdf");
        // return $pdf->download("Off-Campus-Form-{$offCampus->id}-{$timestamp}.pdf");
    }
}
