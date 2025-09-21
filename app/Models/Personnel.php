<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
        return static::with(['unitOrDepartment', 'user'])
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
                ];
            });
    }
    
    public static function totals()
    {
        return [
            'total_personnels' => static::count(),
            'active_personnels' => static::where('status', 'active')->count(),
            'inactive_personnels' => static::where('status', 'inactive')->count(),
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
            ->select('id', 'first_name', 'last_name', 'position', 'unit_or_department_id')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'full_name' => trim("{$p->first_name} {$p->last_name}"),
                'position' => $p->position,
                'unit_or_department_id' => $p->unit_or_department_id,
            ]);
    }
}
