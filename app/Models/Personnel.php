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
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }

    public static function listForIndex()
    {
        return static::with('unitOrDepartment')
            ->select('personnels.*')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'full_name' => $p->full_name,
                    'position' => $p->position,
                    'status' => $p->status,
                    'unit_or_department' => $p->unitOrDepartment?->name,
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
}
