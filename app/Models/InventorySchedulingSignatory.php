<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventorySchedulingSignatory extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inventory_scheduling_signatories';

    protected $fillable = [
        'module_type',
        'role_key',
        'name',
        'title',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    /**
     * Scope a query to filter by module type.
     */
    public function scopeForModule($query, string $moduleType)
    {
        return $query->where('module_type', $moduleType);
    }
}
