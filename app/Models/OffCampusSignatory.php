<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OffCampusSignatory extends Model
{
    protected $fillable = [
        'role_key',
        'name',
        'title',
    ];
}
