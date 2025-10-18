<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Personnel extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'user_id',

        'position',
        'unit_or_department_id',
        'status'
    ];

    protected $casts = [
        'deleted_at'    => 'datetime',
    ];

    protected $appends = ['full_name'];

    public function unitOrDepartment()
    {
        return $this->belongsTo(UnitOrDepartment::class, 'unit_or_department_id');
    }

    public function assignments()
    {
        return $this->hasMany(AssetAssignment::class, 'personnel_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getFullNameAttribute(): string
    {
        $middleInitial = $this->middle_name
            ? strtoupper(substr(trim($this->middle_name), 0, 1)) . '.'
            : '';

        return trim("{$this->first_name} {$middleInitial} {$this->last_name}");
    }

    public static function listForIndex()
    {
        return static::with([
            'unitOrDepartment', 
            'user',
            'assignments.items.asset',
        ])
        ->select('personnels.*')
        ->get()
        ->map(function ($p) {
            return [
                'id' => $p->id,
                'first_name' => $p->first_name,
                'middle_name' => $p->middle_name,
                'last_name' => $p->last_name,
                'full_name' =>$p->full_name,
                'position' => $p->position,
                'status' => $p->status,
                'unit_or_department_id' => $p->unit_or_department_id,
                'unit_or_department' => $p->unitOrDepartment?->name,
                'user_id' => $p->user_id,
                'user_name' => $p->user?->name,
                'assignments_count' => $p->assignments->count(),
                'assigned_assets' => $p->assignments->flatMap(
                    fn($a) =>
                    $a->items->map(fn($i) => [
                        'id' => $i->asset?->id,
                        'name' => $i->asset?->asset_name ?? $i->asset?->serial_no,
                    ])
                )->filter()->values(),

                'latest_assignment_id' => $p->assignments->first()?->id,

                'created_at' => $p->created_at,
                'updated_at' => $p->updated_at,
            ];
        });
    }
    
    public static function totals()
    {
        return [
            'total_personnels' => static::count(),
            'active_personnels' => static::where('status', 'active')->count(),
            'inactive_personnels' => static::where('status', 'inactive')->count(),
            'former_personnels' => static::where('status', 'left_university')->count(),
        ];
    }

    public static function availableUsers()
    {
        // exclude superuser role + already linked users
        $linkedIds = static::pluck('user_id')->filter()->toArray();

        return User::select('id', 'name', 'email')
            ->whereHas('role', function ($q) {
                $q->where('code', '!=', 'superuser');
            })
            ->whereNotIn('id', $linkedIds)
            ->get();
    }

    public static function currentLinkedUsers()
    {
        $linkedIds = static::pluck('user_id')->filter()->toArray();

        return User::select('id', 'name', 'email')
            ->whereHas('role', function ($q) {
                $q->where('code', '!=', 'superuser');
            })
            ->whereIn('id', $linkedIds)
            ->get();
    }

    public static function usersForDropdown()
    {
        return static::availableUsers()
            ->merge(static::currentLinkedUsers())
            ->unique('id')
            ->values();
    }

    public static function activeForAssignments()
    {
        return static::where('status', 'active')
            ->select('id', 'first_name', 'middle_name', 'last_name', 'position', 'unit_or_department_id')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'full_name' => $p->full_name,
                'position' => $p->position,
                'unit_or_department_id' => $p->unit_or_department_id,
            ]);
    }

    public static function availableForNewAssignments()
    {
        $assignedIds = AssetAssignment::pluck('personnel_id')->unique();

        return static::where('status', 'active')
            ->whereNotIn('id', $assignedIds)
            ->select('id', 'first_name', 'middle_name', 'last_name', 'position', 'unit_or_department_id')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'full_name' => $p->full_name,
                'position' => $p->position,
                'unit_or_department_id' => $p->unit_or_department_id,
            ]);
    }

    public static function reportPaginated(array $filters, int $perPage = 10)
    {
        $from = $filters['from'] ?? null;
        $to = $filters['to'] ?? null;

        return static::query()
            ->with('unitOrDepartment:id,name')
            ->select('personnels.*')
            // 🧭 Count of CURRENT assets (active assignment items)
            ->addSelect([
                'current_assets_count' => DB::table('asset_assignment_items')
                    ->join('asset_assignments', 'asset_assignments.id', '=', 'asset_assignment_items.asset_assignment_id')
                    ->join('inventory_lists', 'inventory_lists.id', '=', 'asset_assignment_items.asset_id')
                    ->whereNull('asset_assignment_items.deleted_at')
                    ->whereNull('inventory_lists.deleted_at')
                    ->whereColumn('asset_assignments.personnel_id', 'personnels.id')
                    ->when($from, fn($q) => $q->whereDate('asset_assignment_items.created_at', '>=', $from))
                    ->when($to, fn($q) => $q->whereDate('asset_assignment_items.created_at', '<=', $to))
                    ->selectRaw('COUNT(asset_assignment_items.id)')
            ])
            // 🧭 Count of PAST assets (soft-deleted items)
            ->addSelect([
                'past_assets_count' => DB::table('asset_assignment_items')
                    ->join('asset_assignments', 'asset_assignments.id', '=', 'asset_assignment_items.asset_assignment_id')
                    ->whereColumn('asset_assignments.personnel_id', 'personnels.id')
                    ->whereNotNull('asset_assignment_items.deleted_at')
                    ->when($from, fn($q) => $q->whereDate('asset_assignment_items.deleted_at', '>=', $from))
                    ->when($to, fn($q) => $q->whereDate('asset_assignment_items.deleted_at', '<=', $to))
                    ->selectRaw('COUNT(asset_assignment_items.id)')
            ])
            ->when(
                $filters['department_id'] ?? null,
                fn($q, $dept) =>
                $q->where('unit_or_department_id', $dept)
            )
            ->when(
                $filters['status'] ?? null,
                fn($q, $status) =>
                $q->where('status', $status)
            )
            ->having('current_assets_count', '>', 0)
            ->orderBy('last_name')
            ->paginate($perPage)
            ->withQueryString();
    }

    public static function reportChartData(array $filters = [])
    {
        $from = $filters['from'] ?? null;
        $to = $filters['to'] ?? null;

        $records = static::query()
            ->select('personnels.*')
            ->addSelect([
                'current_assets_count' => DB::table('asset_assignment_items')
                    ->join('asset_assignments', 'asset_assignments.id', '=', 'asset_assignment_items.asset_assignment_id')
                    ->join('inventory_lists', 'inventory_lists.id', '=', 'asset_assignment_items.asset_id')
                    ->whereNull('asset_assignment_items.deleted_at')
                    ->whereNull('inventory_lists.deleted_at')
                    ->whereColumn('asset_assignments.personnel_id', 'personnels.id')
                    ->when($from, fn($q) => $q->whereDate('asset_assignment_items.created_at', '>=', $from))
                    ->when($to, fn($q) => $q->whereDate('asset_assignment_items.created_at', '<=', $to))
                    ->selectRaw('COUNT(asset_assignment_items.id)')
            ])
            ->addSelect([
                'past_assets_count' => DB::table('asset_assignment_items')
                    ->join('asset_assignments', 'asset_assignments.id', '=', 'asset_assignment_items.asset_assignment_id')
                    ->whereColumn('asset_assignments.personnel_id', 'personnels.id')
                    ->whereNotNull('asset_assignment_items.deleted_at')
                    ->when($from, fn($q) => $q->whereDate('asset_assignment_items.deleted_at', '>=', $from))
                    ->when($to, fn($q) => $q->whereDate('asset_assignment_items.deleted_at', '<=', $to))
                    ->selectRaw('COUNT(asset_assignment_items.id)')
            ])
            ->having('current_assets_count', '>', 0)
            ->orderBy('last_name')
            ->get();

        return $records->map(fn($p) => [
            'name'    => $p->full_name,
            'current' => (int) $p->current_assets_count,
            'past'    => (int) $p->past_assets_count,
        ]);
    }

    public static function reportExportData(array $filters = [])
    {
        $from = $filters['from'] ?? null;
        $to = $filters['to'] ?? null;

        $records = static::query()
            ->with('unitOrDepartment:id,name')
            ->select('personnels.*')
            ->withCount([
                'assignments as current_assets_count' => function ($q) use ($from, $to) {
                    $q->whereHas('items', function ($i) use ($from, $to) {
                        $i->whereNull('deleted_at')
                            ->whereHas('asset', fn($a) => $a->whereNull('deleted_at'))
                            ->when($from, fn($x) => $x->whereDate('created_at', '>=', $from))
                            ->when($to, fn($x) => $x->whereDate('created_at', '<=', $to));
                    })
                        ->selectRaw('COUNT(asset_assignment_items.id)');
                },
            ])
            ->addSelect([
                'past_assets_count' => AssetAssignment::selectRaw('COUNT(asset_assignment_items.id)')
                    ->join('asset_assignment_items', 'asset_assignments.id', '=', 'asset_assignment_items.asset_assignment_id')
                    ->whereColumn('asset_assignments.personnel_id', 'personnels.id')
                    ->whereNotNull('asset_assignment_items.deleted_at')
                    ->when($from, fn($q) => $q->whereDate('asset_assignment_items.deleted_at', '>=', $from))
                    ->when($to, fn($q) => $q->whereDate('asset_assignment_items.deleted_at', '<=', $to))
            ])
            ->having('current_assets_count', '>', 0)
            ->orderBy('last_name')
            ->get();

        return $records->map(fn($p) => [
            'Personnel Name' => $p->full_name,
            'Department'     => $p->unitOrDepartment?->name ?? '—',
            'Status'         => ucfirst(str_replace('_', ' ', $p->status)),
            'Current Assets' => $p->current_assets_count,
            'Past Assets'    => $p->past_assets_count,
        ]);
    }
}
