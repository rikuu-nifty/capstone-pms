<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OffCampusSignatory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'role_key',
        'name',
        'title',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];
}
