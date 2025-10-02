<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TurnoverDisposalSignatory extends Model
{
    use HasFactory;

    protected $table = 'turnover_disposal_signatories';

    protected $fillable = [
        'role_key',
        'name',
        'title',
    ];
}
