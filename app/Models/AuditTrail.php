<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditTrail extends Model
{
    protected $fillable = [
        'auditable_type',
        'auditable_id',
        'actor_id',
        'actor_name',
        'unit_or_department_id',
        'action',
        'subject_type',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'route',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function unitOrDepartment()
    {
        return $this->belongsTo(UnitOrDepartment::class, 'unit_or_department_id');
    }
}
