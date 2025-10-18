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
        $to   = $filters['to'] ?? null;

        return static::query()
            ->with('unitOrDepartment:id,name')
            ->select('personnels.*')

            // CURRENT = all active (not soft-deleted) assets for this personnel
            ->addSelect([
                'current_assets_count' => DB::table('asset_assignment_items as aai')
                    ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
                    ->join('inventory_lists as il', 'il.id', '=', 'aai.asset_id')
                    ->whereNull('aai.deleted_at')
                    ->whereNull('il.deleted_at')
                    ->whereColumn('aa.personnel_id', 'personnels.id')
                    ->when($from, fn($q) => $q->whereDate('aai.date_assigned', '>=', $from))
                    ->when($to, fn($q) => $q->whereDate('aai.date_assigned', '<=', $to))
                    ->selectRaw('COUNT(aai.id)')
            ])

            // PAST = assets that were assigned before the most recent assignment date
            ->addSelect([
                'past_assets_count' => DB::table('asset_assignment_items as aai')
                    ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
                    ->whereColumn('aa.personnel_id', 'personnels.id')
                    ->whereNull('aai.deleted_at')
                    ->whereDate('aai.date_assigned', '<', DB::raw('(
                    SELECT MAX(aai2.date_assigned)
                    FROM asset_assignment_items aai2
                    JOIN asset_assignments aa2 ON aa2.id = aai2.asset_assignment_id
                    WHERE aa2.personnel_id = personnels.id
                )'))
                    ->when($from, fn($q) => $q->whereDate('aai.date_assigned', '>=', $from))
                    ->when($to, fn($q) => $q->whereDate('aai.date_assigned', '<=', $to))
                    ->selectRaw('COUNT(aai.id)')
            ])

            ->when(
                $filters['department_id'] ?? null,
                fn($q, $dept) => $q->where('unit_or_department_id', $dept)
            )
            ->when(
                $filters['status'] ?? null,
                fn($q, $status) => $q->where('status', $status)
            )

            ->having('current_assets_count', '>', 0)
            ->orderBy('last_name')
            ->paginate($perPage)
            ->withQueryString();
    }


    public static function reportChartData(array $filters = [])
    {
        $from = $filters['from'] ?? null;
        $to   = $filters['to'] ?? null;

        $records = static::query()
            ->select('personnels.*')

            // CURRENT = all not soft-deleted assets
            ->addSelect([
                'current_assets_count' => DB::table('asset_assignment_items as aai')
                    ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
                    ->join('inventory_lists as il', 'il.id', '=', 'aai.asset_id')
                    ->whereNull('aai.deleted_at')
                    ->whereNull('il.deleted_at')
                    ->whereColumn('aa.personnel_id', 'personnels.id')
                    ->when($from, fn($q) => $q->whereDate('aai.date_assigned', '>=', $from))
                    ->when($to, fn($q) => $q->whereDate('aai.date_assigned', '<=', $to))
                    ->selectRaw('COUNT(aai.id)')
            ])

            // PAST = items assigned before the latest date_assigned per personnel
            ->addSelect([
                'past_assets_count' => DB::table('asset_assignment_items as aai')
                    ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
                    ->whereColumn('aa.personnel_id', 'personnels.id')
                    ->whereNull('aai.deleted_at')
                    ->whereDate('aai.date_assigned', '<', DB::raw('(
                    SELECT MAX(aai2.date_assigned)
                    FROM asset_assignment_items aai2
                    JOIN asset_assignments aa2 ON aa2.id = aai2.asset_assignment_id
                    WHERE aa2.personnel_id = personnels.id
                )'))
                    ->when($from, fn($q) => $q->whereDate('aai.date_assigned', '>=', $from))
                    ->when($to, fn($q) => $q->whereDate('aai.date_assigned', '<=', $to))
                    ->selectRaw('COUNT(aai.id)')
            ])

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
        $to   = $filters['to'] ?? null;

        $records = static::query()
            ->with('unitOrDepartment:id,name')
            ->select('personnels.*')

            // CURRENT = all active assets
            ->addSelect([
                'current_assets_count' => DB::table('asset_assignment_items as aai')
                    ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
                    ->join('inventory_lists as il', 'il.id', '=', 'aai.asset_id')
                    ->whereNull('aai.deleted_at')
                    ->whereNull('il.deleted_at')
                    ->whereColumn('aa.personnel_id', 'personnels.id')
                    ->when($from, fn($q) => $q->whereDate('aai.date_assigned', '>=', $from))
                    ->when($to, fn($q) => $q->whereDate('aai.date_assigned', '<=', $to))
                    ->selectRaw('COUNT(aai.id)')
            ])

            // PAST = earlier assignments before latest
            ->addSelect([
                'past_assets_count' => DB::table('asset_assignment_items as aai')
                    ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
                    ->whereColumn('aa.personnel_id', 'personnels.id')
                    ->whereNull('aai.deleted_at')
                    ->whereDate('aai.date_assigned', '<', DB::raw('(
                    SELECT MAX(aai2.date_assigned)
                    FROM asset_assignment_items aai2
                    JOIN asset_assignments aa2 ON aa2.id = aai2.asset_assignment_id
                    WHERE aa2.personnel_id = personnels.id
                )'))
                    ->when($from, fn($q) => $q->whereDate('aai.date_assigned', '>=', $from))
                    ->when($to, fn($q) => $q->whereDate('aai.date_assigned', '<=', $to))
                    ->selectRaw('COUNT(aai.id)')
            ])

            ->orderBy('last_name')
            ->get();

        return $records->map(fn($p) => [
            'Personnel Name' => $p->full_name,
            'Department'     => $p->unitOrDepartment?->name ?? '—',
            'Status'         => ucfirst(str_replace('_', ' ', $p->status)),
            'Current Assets' => (int) $p->current_assets_count,
            'Past Assets'    => (int) $p->past_assets_count,
        ]);
    }
}
