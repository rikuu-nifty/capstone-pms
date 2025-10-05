<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TurnoverDisposalSignatory extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'turnover_disposal_signatories';

    protected $fillable = [
        'role_key',
        'name',
        'title',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];
}
