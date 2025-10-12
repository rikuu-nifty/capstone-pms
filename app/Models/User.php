<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Gate;

use App\Models\UserDetail;
use App\Models\EmailVerificationCode;
use App\Models\OffCampus;
use App\Models\Role;

use App\Notifications\UserApprovedNotification;
use App\Notifications\UserDeniedNotification;
use App\Notifications\UserRoleReassignedNotification;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Events\RoleChanged;

// class User extends Authenticatable implements MustVerifyEmail  
class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $with = ['role'];

    protected $appends = [
        'can_delete'
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'role_id',
        'email',
        'password',
        'status',
        'approved_at',
        'approval_notes',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */

    // If you don’t care about email verification timestamps:
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'deleted_at'        => 'datetime',
        ];
    }

    protected static function booted()
    {
        static::deleting(function ($user) {
            // Clean DB sessions if you're using the 'database' session driver
            if (config('session.driver') === 'database' && Schema::hasTable('sessions')) {
                DB::table('sessions')->where('user_id', $user->id)->delete();
            }
        });
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function detail()
    {
        return $this->hasOne(UserDetail::class);
    }

    public function emailVerificationCodes()
    {
        return $this->hasMany(EmailVerificationCode::class);
    }

    public function issuedOffCampuses()
    {
        return $this->hasMany(OffCampus::class, 'issued_by_id');
    }

    public function scopePending($q)
    { 
        return $q->where('status','pending'); 
    }

    public function scopeApproved($q)
    { 
        return $q->where('status','approved'); 
    }
    
    public function scopeDenied($q)
    { 
        return $q->where('status','denied'); 
    }

    public function hasPermission(string $code): bool
    {
        if (!$this->role) return false;
        if ($this->role->code === 'superuser') return true;

        $perms = $this->role->relationLoaded('permissions')
            ? $this->role->permissions
            : $this->role->permissions()->get(['code']);

        return $perms->contains('code', $code);
    }

    public function unitOrDepartment() {
        return $this->belongsTo(UnitOrDepartment::class);
    }

    public function scopeSearch($query, ?string $q)
    {
        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('email', 'like', "%{$q}%")
                    ->orWhereHas('detail', fn($wd) =>
                    $wd->where('first_name', 'like', "%{$q}%")
                        ->orWhere('last_name', 'like', "%{$q}%"));
            });
        }
        return $query;
    }

    public function scopeFilterStatus($query, ?string $filter)
    {
        if (in_array($filter, ['pending', 'approved', 'denied'])) {
            $query->where('status', $filter);
        }
        return $query;
    }

    public static function fetchSystemUsers(string $q = '', ?int $roleId = null, int $perPage = 10)
    {
        return static::query()
            ->with([
                'detail:id,user_id,first_name,middle_name,last_name,image_path', 
                'role:id,name,code',
                'unitOrDepartment:id,name',
            ])
            ->approved()
            ->search($q)
            ->roleFilter($roleId)
            ->paginate($perPage);
    }

    public function scopeRoleFilter($query, ?int $roleId)
    {
        if ($roleId) {
            $query->where('role_id', $roleId);
        }
        return $query;
    }

    public function approveWithRoleAndNotify(Role $role, ?string $notes = null): void
    {
        if ($this->status === 'approved') {
            return;
        }

        $oldRoleName = $this->role?->name ?? 'Unassigned';

        $this->update([
            'status'         => 'approved',
            'role_id'        => $role->id,
            'approved_at'    => now(),
            'approval_notes' => $notes,
        ]);

        $newRoleName = $role->name;

        // 🔹 Fire RoleChanged event
        RoleChanged::dispatch($this, $oldRoleName, $newRoleName);

        $this->notify(new UserApprovedNotification($notes));
    }

    public function rejectWithNotes(?string $notes = null): void
    {
        if ($this->status === 'denied') {
            return;
        }

        $this->update([
            'status'          => 'denied',
            'rejected_at'     => now(),
            'rejection_notes' => $notes,
        ]);

        if (class_exists(UserDeniedNotification::class)) {
            $this->notify(new UserDeniedNotification($notes));
        }
    }

    public function reassignRoleWithNotify(Role $role, ?string $notes = null): void
    {
        $oldRoleName = $this->role?->name ?? 'Unassigned';

        $this->update([
            'role_id'           => $role->id,
            'role_changed_at'   => now(),
            'role_change_notes' => $notes,
        ]);

        $newRoleName = $role->name;

        // 🔹 Fire RoleChanged event
        RoleChanged::dispatch($this, $oldRoleName, $newRoleName);

        $this->notify(new UserRoleReassignedNotification(
            $oldRoleName, 
            $newRoleName, 
            $notes
        ));
    }

    public static function fetchApprovals(string $filter = '', string $q = '', int $perPage = 10)
    {
        return self::with([
                'detail:id,user_id,first_name,middle_name,last_name', 
                'role:id,name,code'
            ])
            ->filterStatus($filter)
            ->search($q)
            ->paginate($perPage);
    }

    public static function fetchTotals(): array
    {
        return [
            'users'    => static::count(),
            'approved' => static::where('status', 'approved')->count(),
            'pending'  => static::where('status', 'pending')->count(),
            'denied'   => static::where('status', 'denied')->count(),
        ];
    }

    public function getCanDeleteAttribute()
    {
        return Gate::allows('delete-users', $this);
    }


    public function notifications()
    {
        return $this->morphMany(\Illuminate\Notifications\DatabaseNotification::class, 'notifiable')
            ->orderBy('created_at', 'desc');
    }

    /**
     * Get only unread notifications.
     */
    public function unreadNotifications()
    {
        return $this->notifications()->whereNull('read_at');
    }

    /**
     * Override the default password reset link email
     */
    public function sendPasswordResetNotification($token)
    {
        $url = url(route('password.reset', ['token' => $token, 'email' => $this->email], false));

        $this->notify(new \App\Notifications\PasswordResetLinkNotification($url));
    }
}
