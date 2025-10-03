<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\InventoryList;
use App\Models\InventoryScheduling;
use App\Models\Transfer;
use App\Models\TurnoverDisposal;
use App\Models\OffCampus;
use App\Models\AssetModel;
use App\Models\Category;
use App\Models\AssetAssignment;
use App\Models\EquipmentCode;

class TrashBinController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->input('date_filter', 'all');
        $perPage = (int) $request->input('per_page', 20);

        $applyFilters = function ($query) use ($filter, $request) {
            return $query
                ->when(
                    $filter === 'current_year',
                    fn($q) =>
                    $q->whereYear('deleted_at', now()->year)
                )
                ->when(
                    $filter === 'last_quarter',
                    fn($q) =>
                    $q->whereBetween('deleted_at', [
                        now()->subQuarter()->startOfQuarter(),
                        now()->subQuarter()->endOfQuarter(),
                    ])
                )
                ->when(
                    $filter === 'last_year',
                    fn($q) =>
                    $q->whereYear('deleted_at', now()->subYear()->year)
                )
                ->when(
                    $filter === 'custom' && $request->filled(['start', 'end']),
                    fn($q) =>
                    $q->whereBetween('deleted_at', [$request->start, $request->end])
                );
        };

        return Inertia::render('trash-bin/index', [
            'inventory_lists'       => $applyFilters(InventoryList::onlyTrashed())->paginate($perPage)->withQueryString(),
            'inventory_schedulings' => $applyFilters(InventoryScheduling::onlyTrashed())->paginate($perPage)->withQueryString(),
            'transfers'             => $applyFilters(Transfer::onlyTrashed())->paginate($perPage)->withQueryString(),
            'turnover_disposals'    => $applyFilters(TurnoverDisposal::onlyTrashed())->paginate($perPage)->withQueryString(),
            'off_campuses'          => $applyFilters(OffCampus::onlyTrashed())->paginate($perPage)->withQueryString(),

            // Assets group
            'asset_models'          => $applyFilters(AssetModel::onlyTrashed())->paginate($perPage)->withQueryString(),
            'categories'            => $applyFilters(Category::onlyTrashed())->paginate($perPage)->withQueryString(),
            'assignments'           => $applyFilters(AssetAssignment::onlyTrashed())->paginate($perPage)->withQueryString(),
            'equipment_codes'       => $applyFilters(EquipmentCode::onlyTrashed())->paginate($perPage)->withQueryString(),

            'filters' => [
                'date_filter' => $filter,
                'start'       => $request->start,
                'end'         => $request->end,
                'per_page'    => $perPage,
            ],
        ]);
    }

    public function restore(string $type, int $id)
    {
        $model = $this->resolveModel($type)::withTrashed()->findOrFail($id);
        $model->restore();

        return back()->with('success', ucfirst($type) . ' restored successfully.');
    }

    private function resolveModel(string $type): string
    {
        return match ($type) {
            'inventory-list'     => InventoryList::class,
            'inventory-schedule' => InventoryScheduling::class,
            'transfer'           => Transfer::class,
            'turnover-disposal'  => TurnoverDisposal::class,
            'off-campus'         => OffCampus::class,

            'asset-model'        => AssetModel::class,
            'category'           => Category::class,
            'assignment'         => AssetAssignment::class,
            'equipment-code'     => EquipmentCode::class,

            default => abort(404),
        };
    }
}
