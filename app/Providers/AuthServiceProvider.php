<?php

namespace App\Providers;

use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        // User::class => UserPolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('view-users-page', function (User $user) {
            Log::info('Gate check view-users-page', [
                'user_id'   => $user->id,
                'role_code' => $user->role?->code,
                'status'    => $user->status,
                'in_array'  => in_array($user->role?->code, ['vp_admin', 'pmo_head']),
            ]);
            $user->loadMissing('role');
            return in_array($user->role?->code, ['vp_admin', 'pmo_head']);
        });

        Gate::define('assign-role', function (User $user, string $targetRoleCode) {

            if ($user->role?->code === 'vp_admin') {
                return true;
            }

            if ($user->role?->code === 'pmo_head') {
                return in_array($targetRoleCode, ['pmo_staff']);
            }

            return false; // default deny
        });

        Gate::define('reassign-role', function (User $user, string $targetRoleCode) {
            return Gate::forUser($user)->allows('assign-role', $targetRoleCode);
        });
        
    }
}
