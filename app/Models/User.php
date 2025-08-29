<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;   
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\UserDetail;
use App\Models\EmailVerificationCode;
use App\Models\OffCampus;
use App\Models\Role;

use App\Notifications\UserApprovedNotification;
use App\Notifications\UserDeniedNotification;
use App\Notifications\UserRoleReassignedNotification;

class User extends Authenticatable implements MustVerifyEmail  
{
    use HasFactory, Notifiable;

    protected $with = ['role'];
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

    public function scopeSearch($query, ?string $term)
    {
        if (empty($term)) return $query;

        return $query->where(function ($q) use ($term) {
            $q->where('email', 'like', "%{$term}%")
                ->orWhere('name', 'like', "%{$term}%");
        });
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function approveWithRoleAndNotify(Role $role, ?string $notes = null): void
    {
        if ($this->status === 'approved') {
            return;
        }

        $this->update([
            'status'         => 'approved',
            'role_id'        => $role->id,
            'approved_at'    => now(),
            'approval_notes' => $notes,
        ]);

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

        $this->notify(new UserRoleReassignedNotification(
            $oldRoleName, 
            $role->name, 
            $notes
        ));
    }

    public static function fetchForApprovals(string $filter = 'pending', int $perPage = 10)
    {
        $query = static::with([
            'detail:id,user_id,first_name,last_name', 
            'role:id,name,code'
        ]);

        if (in_array($filter, ['pending', 'approved', 'denied'])) {
            $query->byStatus($filter);
        }

        return $query->paginate($perPage);
    }
}
