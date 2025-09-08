<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventorySchedulingSignatory extends Model
{
     protected $fillable = [
        'role_key', 'name', 'title',
    ];
}
