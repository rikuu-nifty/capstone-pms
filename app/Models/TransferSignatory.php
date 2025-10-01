<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransferSignatory extends Model
{
    use HasFactory;

    protected $table = 'transfer_signatories';

    protected $fillable = [
        'role_key',
        'name',
        'title',
    ];
}
