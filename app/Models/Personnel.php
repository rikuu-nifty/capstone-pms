<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

use App\Models\InventoryList;

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
        $assetStatus = $filters['asset_status'] ?? null;
        $categoryId  = $filters['category_id'] ?? null;

        // performance optimization
        $latestAssignments = DB::table('asset_assignment_items as aai2')
            ->join('asset_assignments as aa2', 'aa2.id', '=', 'aai2.asset_assignment_id')
            ->select(
                'aa2.personnel_id',
                DB::raw('MAX(aai2.date_assigned) as latest_date_assigned')
            )
            ->when($from, fn($q) => $q->whereDate('aai2.date_assigned', '>=', $from))
            ->when($to, fn($q) => $q->whereDate('aai2.date_assigned', '<=', $to))
            ->groupBy('aa2.personnel_id');
        // main query 
        $query = static::query()->with('unitOrDepartment:id,name')->select('personnels.*')
            ->leftJoinSub($latestAssignments, 'latest_per_personnel', function ($join) {
                $join->on('personnels.id', '=', 'latest_per_personnel.personnel_id');
            });
        // CURRENT ASSETS COUNT
        $query->addSelect([
            'current_assets_count' => DB::table('asset_assignment_items as aai')
                ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
                ->join('inventory_lists as il', 'il.id', '=', 'aai.asset_id')
                ->whereNull('aai.deleted_at')
                ->whereNull('il.deleted_at')
                ->whereColumn('aa.personnel_id', 'personnels.id')
                ->when($from, fn($q) => $q->whereDate('aai.date_assigned', '>=', $from))
                ->when($to, fn($q) => $q->whereDate('aai.date_assigned', '<=', $to))
                ->when($assetStatus, fn($q) => $q->where('il.status', '=', $assetStatus))
                ->when(
                    $categoryId,
                    fn($q) =>
                    $q->whereIn('il.asset_model_id', function ($sub) use ($categoryId) {
                        $sub->select('id')
                            ->from('asset_models')
                            ->where('category_id', '=', $categoryId);
                    })
                )
                ->selectRaw('COUNT(aai.id)')
        ]);
        // PAST ASSETS COUNT
        $query->addSelect([
            'past_assets_count' => DB::table('asset_assignment_items as aai')
                ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
                ->join('inventory_lists as il', 'il.id', '=', 'aai.asset_id')
                ->whereColumn('aa.personnel_id', 'personnels.id')
                ->whereNull('aai.deleted_at')
                ->where('aai.date_assigned', '<', DB::raw("(
                    SELECT MAX(aai2.date_assigned)
                    FROM asset_assignment_items aai2
                    JOIN asset_assignments aa2 ON aa2.id = aai2.asset_assignment_id
                    WHERE aa2.personnel_id = personnels.id
                    " . ($from ? "AND aai2.date_assigned >= '$from'" : '') . "
                    " . ($to ? "AND aai2.date_assigned <= '$to'" : '') . "
                )"))
                ->when($from, fn($q) => $q->whereDate('aai.date_assigned', '>=', $from))
                ->when($to, fn($q) => $q->whereDate('aai.date_assigned', '<=', $to))
                ->when($assetStatus, fn($q) => $q->where('il.status', '=', $assetStatus))
                ->when(
                    $categoryId,
                    fn($q) =>
                    $q->whereIn('il.asset_model_id', function ($sub) use ($categoryId) {
                        $sub->select('id')
                            ->from('asset_models')
                            ->where('category_id', '=', $categoryId);
                    })
                )
                ->selectRaw('COUNT(aai.id)')
        ]);
        // MISSING ASSETS COUNT
        $query->addSelect([
            'missing_assets_count' => DB::table('asset_assignment_items as aai')
                ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
                ->join('inventory_lists as il', 'il.id', '=', 'aai.asset_id')
                ->whereNull('aai.deleted_at')
                ->whereColumn('aa.personnel_id', 'personnels.id')
                ->where('il.status', '=', 'missing')
                ->when($assetStatus && $assetStatus !== 'missing', fn($q) => $q->whereRaw('1=0'))
                ->when(
                    $categoryId,
                    fn($q) =>
                    $q->whereIn('il.asset_model_id', function ($sub) use ($categoryId) {
                        $sub->select('id')
                            ->from('asset_models')
                            ->where('category_id', '=', $categoryId);
                    })
                )
                ->selectRaw('COUNT(aai.id)')
        ]);

        // Filter + Order + Paginate
        $query
            ->when($filters['department_id'] ?? null, fn($q, $dept) => $q->where('unit_or_department_id', $dept))
            ->when($filters['status'] ?? null, fn($q, $status) => $q->where('status', $status))
            ->when($filters['personnel_id'] ?? null, fn($q, $id) => $q->where('personnels.id', $id))
            ->having('current_assets_count', '>', 0)
            ->orderBy('last_name')
        ;

        return $query->paginate($perPage)->withQueryString();
    }

    public static function reportChartData(array $filters = [])
    {
        $from = $filters['from'] ?? null;
        $to   = $filters['to'] ?? null;
        $assetStatus = $filters['asset_status'] ?? null;
        $categoryId  = $filters['category_id'] ?? null;

        $latestAssignments = DB::table('asset_assignment_items as aai2')
            ->join('asset_assignments as aa2', 'aa2.id', '=', 'aai2.asset_assignment_id')
            ->select(
                'aa2.personnel_id',
                DB::raw('MAX(aai2.date_assigned) as latest_date_assigned')
            )
            ->when($from, fn($q) => $q->whereDate('aai2.date_assigned', '>=', $from))
            ->when($to, fn($q) => $q->whereDate('aai2.date_assigned', '<=', $to))
            ->groupBy('aa2.personnel_id');

        // main personnel query
        $query = static::query()
            ->select('personnels.*')
            ->leftJoinSub($latestAssignments, 'latest_per_personnel', function ($join) {
                $join->on('personnels.id', '=', 'latest_per_personnel.personnel_id');
            });
        // CURRENT ASSETS COUNT
        $query->addSelect([
            'current_assets_count' => DB::table('asset_assignment_items as aai')
                ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
                ->join('inventory_lists as il', 'il.id', '=', 'aai.asset_id')
                ->whereNull('aai.deleted_at')
                ->whereNull('il.deleted_at')
                ->whereColumn('aa.personnel_id', 'personnels.id')
                ->when($from, fn($q) => $q->whereDate('aai.date_assigned', '>=', $from))
                ->when($to, fn($q) => $q->whereDate('aai.date_assigned', '<=', $to))
                ->when($assetStatus, fn($q) => $q->where('il.status', '=', $assetStatus))
                ->when(
                    $categoryId,
                    fn($q) =>
                    $q->whereIn('il.asset_model_id', function ($sub) use ($categoryId) {
                        $sub->select('id')
                            ->from('asset_models')
                            ->where('category_id', '=', $categoryId);
                    })
                )
                ->selectRaw('COUNT(aai.id)')
        ]);

        // PAST ASSETS COUNT — BEST WORKING VERSION
        // $query->addSelect([
        //     'past_assets_count' => DB::table('asset_assignment_items as aai')
        //         ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
        //         ->join('inventory_lists as il', 'il.id', '=', 'aai.asset_id')
        //         ->whereColumn('aa.personnel_id', 'personnels.id')
        //         ->where(function ($q) {
        //             // Either this asset was later reassigned to another person
        //             $q->whereExists(function ($sub) {
        //                 $sub->select(DB::raw(1))
        //                     ->from('asset_assignment_items as aai2')
        //                     ->join('asset_assignments as aa2', 'aa2.id', '=', 'aai2.asset_assignment_id')
        //                     ->whereColumn('aai2.asset_id', 'aai.asset_id')
        //                     ->whereRaw('aai2.date_assigned > aai.date_assigned')
        //                     ->whereRaw('aa2.personnel_id <> aa.personnel_id');
        //             })
        //             // OR it existed before their last reassignment (deleted_at event)
        //             ->orWhereRaw("
        //                 aai.date_assigned < COALESCE((
        //                     SELECT MAX(aai3.deleted_at)
        //                     FROM asset_assignment_items aai3
        //                     JOIN asset_assignments aa3 ON aa3.id = aai3.asset_assignment_id
        //                     WHERE aa3.personnel_id = aa.personnel_id
        //                     AND aai3.deleted_at IS NOT NULL
        //                 ), '9999-12-31 23:59:59')
        //             ");
        //         })
        //         ->when($from, fn($q) => $q->where('aai.date_assigned', '>=', $from))
        //         ->when($to, fn($q) => $q->where('aai.date_assigned', '<=', $to))
        //         ->when($assetStatus, fn($q) => $q->where('il.status', '=', $assetStatus))
        //         ->when($categoryId, function ($q) use ($categoryId) {
        //             $q->whereIn('il.asset_model_id', function ($sub) use ($categoryId) {
        //                 $sub->select('id')->from('asset_models')->where('category_id', '=', $categoryId);
        //             });
        //         })
        //         ->selectRaw('COUNT(DISTINCT aai.asset_id)')
        // ]);

        // PAST ASSETS COUNT — snapshot just BEFORE last deletion
        // $query->addSelect([
        //     'past_assets_count' => DB::table('asset_assignment_items as aai')
        //         ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
        //         ->join('inventory_lists as il', 'il.id', '=', 'aai.asset_id')
        //         // match current personnel
        //         ->whereColumn('aa.personnel_id', 'personnels.id')

        //         // only compute if there is at least one deletion for this personnel
        //         ->whereRaw("(
        //             SELECT MAX(aai3.deleted_at)
        //             FROM asset_assignment_items aai3
        //             JOIN asset_assignments aa3 ON aa3.id = aai3.asset_assignment_id
        //             WHERE aa3.personnel_id = aa.personnel_id
        //         ) IS NOT NULL")

        //         // define T = last deletion timestamp for this personnel
        //         // asset must have been assigned on/before T
        //         ->whereRaw("aai.date_assigned <= (
        //             SELECT MAX(aai3.deleted_at)
        //             FROM asset_assignment_items aai3
        //             JOIN asset_assignments aa3 ON aa3.id = aai3.asset_assignment_id
        //             WHERE aa3.personnel_id = aa.personnel_id
        //         )")

        //         // and still active at T- (deleted after/equal T or not deleted yet)
        //         ->whereRaw("(
        //             aai.deleted_at IS NULL OR aai.deleted_at >= (
        //                 SELECT MAX(aai3.deleted_at)
        //                 FROM asset_assignment_items aai3
        //                 JOIN asset_assignments aa3 ON aa3.id = aai3.asset_assignment_id
        //                 WHERE aa3.personnel_id = aa.personnel_id
        //             )
        //         )")

        //         // optional report filters
        //         ->when($from, fn($q) => $q->whereDate('aai.date_assigned', '>=', $from))
        //         ->when($to, fn($q) => $q->whereDate('aai.date_assigned', '<=', $to))
        //         ->when($assetStatus, fn($q) => $q->where('il.status', '=', $assetStatus))
        //         ->when($categoryId, function ($q) use ($categoryId) {
        //             $q->whereIn('il.asset_model_id', function ($sub) use ($categoryId) {
        //                 $sub->select('id')->from('asset_models')->where('category_id', '=', $categoryId);
        //             });
        //         })
        //         ->selectRaw('COUNT(DISTINCT aai.asset_id)')
        // ]);

        // PAST ASSETS COUNT — snapshot just BEFORE the last change (gain OR loss)
        // $query->addSelect([
        //     'past_assets_count' => DB::table('asset_assignment_items as aai')
        //         ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
        //         ->join('inventory_lists as il', 'il.id', '=', 'aai.asset_id')
        //         ->whereColumn('aa.personnel_id', 'personnels.id')

        //         // If there are truly no events (no aai rows for this personnel), return 0 quickly
        //         ->whereExists(function ($sub) {
        //             $sub->select(DB::raw(1))
        //                 ->from('asset_assignment_items as e')
        //                 ->join('asset_assignments as ee', 'ee.id', '=', 'e.asset_assignment_id')
        //                 ->whereColumn('ee.personnel_id', 'aa.personnel_id');
        //         })

        //         // Branch: last deletion vs last gain
        //         ->whereRaw("
        //             (
        //                 -- Last event is a deletion
        //                 (
        //                     COALESCE(
        //                         (SELECT MAX(d.deleted_at)
        //                         FROM asset_assignment_items d
        //                         JOIN asset_assignments da ON da.id = d.asset_assignment_id
        //                         WHERE da.personnel_id = aa.personnel_id),
        //                         '0000-00-00 00:00:00'
        //                     )
        //                     >=
        //                     COALESCE(
        //                         (SELECT MAX(g.date_assigned)
        //                         FROM asset_assignment_items g
        //                         JOIN asset_assignments ga ON ga.id = g.asset_assignment_id
        //                         WHERE ga.personnel_id = aa.personnel_id),
        //                         '0000-00-00 00:00:00'
        //                     )
        //                 )
        //                 AND
        //                 aai.date_assigned <= (
        //                     SELECT MAX(d2.deleted_at)
        //                     FROM asset_assignment_items d2
        //                     JOIN asset_assignments da2 ON da2.id = d2.asset_assignment_id
        //                     WHERE da2.personnel_id = aa.personnel_id
        //                 )
        //                 AND
        //                 (aai.deleted_at IS NULL OR aai.deleted_at >= (
        //                     SELECT MAX(d3.deleted_at)
        //                     FROM asset_assignment_items d3
        //                     JOIN asset_assignments da3 ON da3.id = d3.asset_assignment_id
        //                     WHERE da3.personnel_id = aa.personnel_id
        //                 ))
        //             )
        //             OR
        //             (
        //                 -- Last event is a gain (assignment)
        //                 (
        //                     COALESCE(
        //                         (SELECT MAX(g.deleted_at)
        //                         FROM asset_assignment_items g
        //                         JOIN asset_assignments ga ON ga.id = g.asset_assignment_id
        //                         WHERE ga.personnel_id = aa.personnel_id),
        //                         '0000-00-00 00:00:00'
        //                     )
        //                     <
        //                     COALESCE(
        //                         (SELECT MAX(h.date_assigned)
        //                         FROM asset_assignment_items h
        //                         JOIN asset_assignments ha ON ha.id = h.asset_assignment_id
        //                         WHERE ha.personnel_id = aa.personnel_id),
        //                         '0000-00-00 00:00:00'
        //                     )
        //                 )
        //                 AND
        //                 aai.date_assigned < (
        //                     SELECT MAX(h2.date_assigned)
        //                     FROM asset_assignment_items h2
        //                     JOIN asset_assignments ha2 ON ha2.id = h2.asset_assignment_id
        //                     WHERE ha2.personnel_id = aa.personnel_id
        //                 )
        //                 AND
        //                 (aai.deleted_at IS NULL OR aai.deleted_at >= (
        //                     SELECT MAX(h3.date_assigned)
        //                     FROM asset_assignment_items h3
        //                     JOIN asset_assignments ha3 ON ha3.id = h3.asset_assignment_id
        //                     WHERE ha3.personnel_id = aa.personnel_id
        //                 ))
        //             )
        //         ")

        //         // keep your optional report filters
        //         ->when($from, fn($q) => $q->whereDate('aai.date_assigned', '>=', $from))
        //         ->when($to, fn($q) => $q->whereDate('aai.date_assigned', '<=', $to))
        //         ->when($assetStatus, fn($q) => $q->where('il.status', '=', $assetStatus))
        //         ->when($categoryId, function ($q) use ($categoryId) {
        //             $q->whereIn('il.asset_model_id', function ($sub) use ($categoryId) {
        //                 $sub->select('id')->from('asset_models')->where('category_id', '=', $categoryId);
        //             });
        //         })
        //         ->selectRaw('COUNT(DISTINCT aai.asset_id)')
        // ]);

        // Subquery: last change per personnel (gain OR loss)
        $lastEvents = DB::table('asset_assignment_items as e')
            ->join('asset_assignments as a', 'a.id', '=', 'e.asset_assignment_id')
            ->selectRaw("
                a.personnel_id,
                MAX(e.deleted_at) AS last_del,
                MAX(e.date_assigned) AS last_gain,
                CASE
                    WHEN COALESCE(MAX(e.deleted_at), '0000-00-00 00:00:00') >= COALESCE(MAX(e.date_assigned), '0000-00-00 00:00:00')
                        THEN MAX(e.deleted_at)
                    ELSE MAX(e.date_assigned)
                END AS t_event,
                CASE
                    WHEN COALESCE(MAX(e.deleted_at), '0000-00-00 00:00:00') >= COALESCE(MAX(e.date_assigned), '0000-00-00 00:00:00')
                        THEN 'del'
                    ELSE 'gain'
                END AS kind
            ")
            ->groupBy('a.personnel_id');

        // PAST ASSETS COUNT — snapshot just BEFORE the last change (gain OR loss)
        $query->addSelect([
            'past_assets_count' => DB::table('asset_assignment_items as aai')
                ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
                ->join('inventory_lists as il', 'il.id', '=', 'aai.asset_id')
                ->joinSub($lastEvents, 'le', function ($j) {
                    $j->on('le.personnel_id', '=', 'aa.personnel_id');
                })
                ->whereColumn('aa.personnel_id', 'personnels.id')
                ->whereColumn('le.personnel_id', 'personnels.id')
                ->whereNotNull('le.t_event')
                // assigned before the event instant (<= for deletion, < for gain)
                ->whereRaw("IF(le.kind = 'del', aai.date_assigned <= le.t_event, aai.date_assigned < le.t_event)")
                // still active at that instant
                ->whereRaw("(aai.deleted_at IS NULL OR aai.deleted_at >= le.t_event)")
                // optional filters
                ->when($from, fn($q) => $q->whereDate('aai.date_assigned', '>=', $from))
                ->when($to, fn($q) => $q->whereDate('aai.date_assigned', '<=', $to))
                ->when($assetStatus, fn($q) => $q->where('il.status', '=', $assetStatus))
                ->when($categoryId, function ($q) use ($categoryId) {
                    $q->whereIn('il.asset_model_id', function ($sub) use ($categoryId) {
                        $sub->select('id')->from('asset_models')->where('category_id', '=', $categoryId);
                    });
                })
                ->selectRaw('COUNT(DISTINCT aai.asset_id)')
        ]);

        // MISSING ASSETS COUNT
        $query->addSelect([
            'missing_assets_count' => DB::table('asset_assignment_items as aai')
                ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
                ->join('inventory_lists as il', 'il.id', '=', 'aai.asset_id')
                ->whereNull('aai.deleted_at')
                ->whereColumn('aa.personnel_id', 'personnels.id')
                ->where('il.status', '=', 'missing')
                ->when($assetStatus && $assetStatus !== 'missing', fn($q) => $q->whereRaw('1=0'))
                ->when(
                    $categoryId,
                    fn($q) =>
                    $q->whereIn('il.asset_model_id', function ($sub) use ($categoryId) {
                        $sub->select('id')
                            ->from('asset_models')
                            ->where('category_id', '=', $categoryId);
                    })
                )
                ->selectRaw('COUNT(aai.id)')
        ]);

        $records = $query->when($filters['department_id'] ?? null, fn($q, $dept) => $q->where('unit_or_department_id', $dept))
            ->when($filters['status'] ?? null, fn($q, $status) => $q->where('status', $status))
            ->when($filters['personnel_id'] ?? null, fn($q, $id) => $q->where('personnels.id', $id))
            ->having('current_assets_count', '>', 0)
            ->orderBy('last_name')
            ->get()
        ;

        return $records->map(fn($p) => [
            'name'    => $p->full_name,
            'current' => (int) $p->current_assets_count,
            'past'    => (int) $p->past_assets_count,
            'missing' => (int) ($p->missing_assets_count ?? 0),
        ]);
    }

    public static function reportExportData(array $filters = [])
    {
        $from = $filters['from'] ?? null;
        $to   = $filters['to'] ?? null;
        $assetStatus = $filters['asset_status'] ?? null;
        $categoryId  = $filters['category_id'] ?? null;

        $latestAssignments = DB::table('asset_assignment_items as aai2')
            ->join('asset_assignments as aa2', 'aa2.id', '=', 'aai2.asset_assignment_id')
            ->select(
                'aa2.personnel_id',
                DB::raw('MAX(aai2.date_assigned) as latest_date_assigned')
            )
            ->when($from, fn($q) => $q->whereDate('aai2.date_assigned', '>=', $from))
            ->when($to, fn($q) => $q->whereDate('aai2.date_assigned', '<=', $to))
            ->groupBy('aa2.personnel_id');

        $query = static::query()
            ->with('unitOrDepartment:id,name')
            ->select('personnels.*')
            ->leftJoinSub($latestAssignments, 'latest_per_personnel', function ($join) {
                $join->on('personnels.id', '=', 'latest_per_personnel.personnel_id');
            });
        // CURRENT ASSETS COUNT
        $query->addSelect([
            'current_assets_count' => DB::table('asset_assignment_items as aai')
                ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
                ->join('inventory_lists as il', 'il.id', '=', 'aai.asset_id')
                ->whereNull('aai.deleted_at')
                ->whereNull('il.deleted_at')
                ->whereColumn('aa.personnel_id', 'personnels.id')
                ->when($from, fn($q) => $q->whereDate('aai.date_assigned', '>=', $from))
                ->when($to, fn($q) => $q->whereDate('aai.date_assigned', '<=', $to))
                ->when($assetStatus, fn($q) => $q->where('il.status', '=', $assetStatus))
                ->when(
                    $categoryId,
                    fn($q) =>
                    $q->whereIn('il.asset_model_id', function ($sub) use ($categoryId) {
                        $sub->select('id')
                            ->from('asset_models')
                            ->where('category_id', '=', $categoryId);
                    })
                )
                ->selectRaw('COUNT(aai.id)')
        ]);
        // PAST ASSETS COUNT
        $query->addSelect([
            'past_assets_count' => DB::table('asset_assignment_items as aai')
                ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
                ->join('inventory_lists as il', 'il.id', '=', 'aai.asset_id')
                ->whereColumn('aa.personnel_id', 'personnels.id')
                ->whereNull('aai.deleted_at')
                ->where('aai.date_assigned', '<', DB::raw("(
                    SELECT MAX(aai2.date_assigned)
                    FROM asset_assignment_items aai2
                    JOIN asset_assignments aa2 ON aa2.id = aai2.asset_assignment_id
                    WHERE aa2.personnel_id = personnels.id
                    " . ($from ? "AND aai2.date_assigned >= '$from'" : '') . "
                    " . ($to ? "AND aai2.date_assigned <= '$to'" : '') . "
                )"))
                ->when($from, fn($q) => $q->whereDate('aai.date_assigned', '>=', $from))
                ->when($to, fn($q) => $q->whereDate('aai.date_assigned', '<=', $to))
                ->when($assetStatus, fn($q) => $q->where('il.status', '=', $assetStatus))
                ->when(
                    $categoryId,
                    fn($q) =>
                    $q->whereIn('il.asset_model_id', function ($sub) use ($categoryId) {
                        $sub->select('id')
                            ->from('asset_models')
                            ->where('category_id', '=', $categoryId);
                    })
                )
                ->selectRaw('COUNT(aai.id)')
        ]);
        // MISSING ASSETS COUNT  
        $query->addSelect([
            'missing_assets_count' => DB::table('asset_assignment_items as aai')
                ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
                ->join('inventory_lists as il', 'il.id', '=', 'aai.asset_id')
                ->whereNull('aai.deleted_at')
                ->whereColumn('aa.personnel_id', 'personnels.id')
                ->where('il.status', '=', 'missing')
                ->when($assetStatus && $assetStatus !== 'missing', fn($q) => $q->whereRaw('1=0'))
                ->when(
                    $categoryId,
                    fn($q) =>
                    $q->whereIn('il.asset_model_id', function ($sub) use ($categoryId) {
                        $sub->select('id')
                            ->from('asset_models')
                            ->where('category_id', '=', $categoryId);
                    })
                )
                ->selectRaw('COUNT(aai.id)')
        ]);
        $records = $query->when($filters['department_id'] ?? null, fn($q, $dept) => $q->where('unit_or_department_id', $dept))
            ->when($filters['status'] ?? null, fn($q, $status) => $q->where('status', $status))
            ->when($filters['personnel_id'] ?? null, fn($q, $id) => $q->where('personnels.id', $id))
            ->orderBy('last_name')
            ->get()
        ;

        return $records->map(fn($p) => [
            'Personnel Name' => $p->full_name,
            'Department'     => $p->unitOrDepartment?->name ?? '—',
            'Status'         => ucfirst(str_replace('_', ' ', $p->status)),
            'Current Assets' => (int) $p->current_assets_count,
            'Past Assets'    => (int) $p->past_assets_count,
            'Missing Assets' => (int) ($p->missing_assets_count ?? 0),
        ]);
    }

    public static function reportAssetRowsPaginated(array $filters, int $perPage = 10)
    {
        $from = $filters['from'] ?? null;
        $to   = $filters['to'] ?? null;

        $latestAssignments = DB::table('asset_assignment_items as aai2')
            ->join('asset_assignments as aa2', 'aa2.id', '=', 'aai2.asset_assignment_id')
            ->select(
                'aa2.personnel_id',
                DB::raw('MAX(aai2.date_assigned) as latest_date_assigned')
            )
            ->when($from, fn($q) => $q->whereDate('aai2.date_assigned', '>=', $from))
            ->when($to, fn($q) => $q->whereDate('aai2.date_assigned', '<=', $to))
            ->groupBy('aa2.personnel_id');

        $query = DB::table('asset_assignment_items as aai')
            ->join('asset_assignments as aa', 'aa.id', '=', 'aai.asset_assignment_id')
            ->join('personnels as p', 'p.id', '=', 'aa.personnel_id')
            ->leftJoinSub($latestAssignments, 'latest_per_personnel', function ($join) {
                $join->on('p.id', '=', 'latest_per_personnel.personnel_id');
            })
            ->join('inventory_lists as il', 'il.id', '=', 'aai.asset_id')
            ->leftJoin('asset_models as am', 'am.id', '=', 'il.asset_model_id')
            ->leftJoin('categories as c', 'c.id', '=', 'am.category_id')
            ->leftJoin('equipment_codes as ec', 'ec.id', '=', 'am.equipment_code_id')
            ->leftJoin('unit_or_departments as uod', 'uod.id', '=', 'il.unit_or_department_id')
            ->whereNull('aai.deleted_at')
            ->whereNull('il.deleted_at')
            ->when($from, fn($q) => $q->whereDate('aai.date_assigned', '>=', $from))
            ->when($to, fn($q) => $q->whereDate('aai.date_assigned', '<=', $to))
            ->when($filters['department_id'] ?? null, fn($q, $dept)
                => $q->where('il.unit_or_department_id', $dept)
            )
            ->when($filters['personnel_id'] ?? null, fn($q, $personnelId) =>
                $q->where('p.id', $personnelId)
            )
            ->when($filters['status'] ?? null, fn($q, $status) =>
                $q->where('p.status', $status)
            )
            ->when($filters['category_id'] ?? null, fn($q, $categoryId) =>
                $q->where('am.category_id', $categoryId)
            )
            ->when($filters['asset_status'] ?? null, function ($q, $assetStatus) {
                if ($assetStatus === 'missing') {
                    $q->where('il.status', '=', 'missing');
                } elseif ($assetStatus === 'active') {
                    $q->where('il.status', '=', 'active');
                } elseif ($assetStatus === 'archived') {
                    $q->where('il.status', '=', 'archived');
                }
            })
            ->select([
                'aai.id as assignment_item_id',
                'aai.date_assigned',
                'il.id as asset_id',
                'il.asset_name',
                'il.serial_no',
                'il.status as asset_status',
                'c.name as category',
                'uod.name as asset_unit_or_department',
                'ec.code as equipment_code',
                DB::raw("CONCAT(p.first_name, ' ', IFNULL(CONCAT(LEFT(p.middle_name,1),'. '), ''), p.last_name) as personnel_name"),
                DB::raw("(
                SELECT CONCAT(p2.first_name, ' ', IFNULL(CONCAT(LEFT(p2.middle_name,1),'. '), ''), p2.last_name)
                FROM asset_assignment_items aai2
                JOIN asset_assignments aa2 ON aa2.id = aai2.asset_assignment_id
                JOIN personnels p2 ON p2.id = aa2.personnel_id
                WHERE aai2.asset_id = il.id
                AND aai2.date_assigned < aai.date_assigned
                ORDER BY aai2.date_assigned DESC
                LIMIT 1
            ) as previous_personnel_name"),
            ])
            ->orderByDesc('aai.date_assigned');

        $paginator = $query->paginate($perPage)->withQueryString();

        $assetIds = $paginator->getCollection()->pluck('asset_id')->unique()->values();
        // $assets = InventoryList::whereIn('id', $assetIds)->get([
        //     'id', 
        //     'status', 
        //     'current_transfer_status', 
        //     'current_turnover_disposal_status', 
        //     'current_off_campus_status', 
        //     'current_inventory_status'
        // ])->keyBy('id');
        $assets = InventoryList::whereIn('id', $assetIds)->get()->keyBy('id');

        $paginator->getCollection()->transform(function ($row) use ($assets) {
            $asset = $assets[$row->asset_id] ?? null;

            return (object) array_merge((array) $row, [
                'asset_status'                     => $asset?->status ?? $row->asset_status,
                'current_transfer_status'          => $asset?->current_transfer_status,
                'current_turnover_disposal_status' => $asset?->current_turnover_disposal_status,
                'current_off_campus_status'        => $asset?->current_off_campus_status,
                'current_inventory_status'         => $asset?->current_inventory_status,
            ]);
        });

        return $paginator;
    }
}
