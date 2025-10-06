<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TransferSignatory extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'transfer_signatories';

    protected $fillable = [
        'role_key',
        'name',
        'title',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];
}
