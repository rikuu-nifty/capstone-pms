<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
     protected $fillable = [
        'role',
        'description',
    ];

    /**
     * Relationship: A role may belong to many users
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
