<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Permission;

class Role extends Model
{
     protected $fillable = [
        'name',
        'code',
        'description',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_has_permissions');
    }

    public static function findByIdOrFail(int $id): self
    {
        return static::findOrFail($id);
    }
}
