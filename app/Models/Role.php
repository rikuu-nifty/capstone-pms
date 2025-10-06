<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Permission;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Http\Exceptions\HttpResponseException;

class Role extends Model
{
    use SoftDeletes; 
    
    protected $fillable = [
        'name',
        'code',
        'description',
    ];

    protected $casts = [
        'deleted_at'    => 'datetime',
    ];

    protected static function booted(): void
    {
        static::deleting(function (Role $role) {
            $msg = $role->deletionBlockReasonFor(Auth::user());
            if ($msg) {
                // Forces 303 back + flash so your layout opens UnauthorizedModal
                throw new HttpResponseException(
                    back(303)->with('unauthorized', $msg)
                );
            }
        });
    }

    public function deletionBlockReasonFor(?\App\Models\User $actor = null): ?string
    {
        // Protected roles
        if (in_array($this->code, ['superuser', 'vp_admin'])) {
            return $this->code === 'superuser'
                ? 'The “Superuser” role is protected and cannot be deleted.'
                : 'The “VP Admin” role is protected and cannot be deleted.';
        }

        // If an actor was provided, don’t allow deleting your own current role
        if ($actor && (int) $actor->role_id === (int) $this->id) {
            $label = $this->name ?: Str::of($this->code ?? '')
                ->replace('_', ' ')
                ->title()
                ->toString();
            return "You cannot delete your own currently assigned role (“{$label}”).";
        }

        return null;
    }

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

    public static function fetchForDropdown()
    {
        return static::select('id', 'name', 'code')->get();
    }

    public function scopeSearch($query, ?string $q)
    {
        if (!empty($q)) {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('code', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }
        return $query;
    }

    public static function fetchRoles(?string $q = '', int $perPage = 10)
    {
        return static::query()
            ->with([
                'permissions:id,code,name',
                'users:id,role_id'
            ])
            ->withCount(['permissions', 'users'])
            ->search($q)
            ->paginate($perPage)
            ->appends(['q' => $q]);
    }

    public static function createRole(array $data): Role
    {
        return static::create([
            'name' => $data['name'],
            'code' => $data['code'],
            'description' => $data['description'] ?? null,
        ]);
    }

    public static function updateRole(Role $role, array $data): void
    {
        $role->update([
            'name' => $data['name'],
            'code' => $data['code'],
            'description' => $data['description'] ?? null,
        ]);
    }
    
    public static function fetchTotals(): array
    {
        return [
            'roles' => static::count(),
            'permissions' => Permission::count(),
            'users' => User::count(),
        ];
    }

    public static function fetchAllPermissions()
    {
        return Permission::all(['id', 'code', 'name']);
    }

    public static function updatePermissions(Role $role, array $permissionIds = []): void
    {
        $role->permissions()->sync($permissionIds);
    }

    
}
