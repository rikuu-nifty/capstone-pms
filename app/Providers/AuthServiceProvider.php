<?php

namespace App\Providers;

use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use App\Models\Role;

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
        Gate::before(function (User $user, string $ability) {
            if ($user->role?->code === 'superuser') {
                return true;
            }
            return $user->hasPermission($ability) ?: null;
        });

        Gate::define('view-users-page', function (User $user) {
            return $user->hasPermission('view-users-page');
        });

        Gate::define('delete-role', function (User $authUser, Role $targetRole) {
            if ($targetRole->code === 'superuser' || $targetRole->code === 'vp_admin') {
                return false;
            }

            if ($authUser->role?->code === 'vp_admin') {
                return true;
            }

            // PMO Head can manage roles, but not delete them
            if ($authUser->role?->code === 'pmo_head') {
                return false;
            }

            // fallback to DB permissions
            return $authUser->hasPermission('delete-role');
        });

               
    }
}
