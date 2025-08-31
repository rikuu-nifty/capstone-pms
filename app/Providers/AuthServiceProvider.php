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
            if ($ability !== 'delete-role' && $user->role?->code === 'superuser') {
                return true;
            }
            return $user->hasPermission($ability) ?: null;
        });

        Gate::define('delete-role', function (User $authUser, Role $targetRole) {
            if (in_array($targetRole->code, ['superuser', 'vp_admin'])) {
                return false;
            }

            if ($authUser->role_id === $targetRole->id) {
                return false;
            }

            if ($authUser->role?->code === 'vp_admin') {
                return true;
            }

            return $authUser->hasPermission('delete-role');
        });

        Gate::define('delete-users', function (User $authUser, User $targetUser) {
            if ($targetUser->role?->code === 'superuser') {
                return false;
            }

            // Prevent deleting yourself
            if ($authUser->id === $targetUser->id) {
                return false;
            }

            // Superuser can delete anyone (except themselves, already blocked)
            if ($authUser->role?->code === 'superuser') {
                return true;
            }

            // VP Admin can delete anyone else (except themselves & superuser)
            if ($authUser->role?->code === 'vp_admin') {
                return true;
            }

            return $authUser->hasPermission('delete-users');
        });
    }
}
