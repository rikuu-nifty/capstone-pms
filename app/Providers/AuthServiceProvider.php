<?php

namespace App\Providers;

use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Auth\Access\Response;
use App\Models\Role;
use App\Models\Permission;

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
            if ($user->role?->code === 'superuser' && $ability !== 'delete-role') {
                return true;
            }

            $contextual = ['delete-users', 'delete-role'];

            if (in_array($ability, $contextual, true)) {
                return null;
            }

            return $user->hasPermission($ability) ?: null;
        });

        $contextual = ['delete-users', 'delete-role'];

        foreach (Permission::pluck('code') as $code) {
            if (in_array($code, $contextual, true)) continue;
            if (Gate::has($code)) continue;
            Gate::define($code, fn(User $user) => $user->hasPermission($code));
        }

        Gate::define('delete-role', function (User $authUser, Role $targetRole) {
            if ($msg = $targetRole->deletionBlockReasonFor($authUser)) {
                return Response::deny($msg);
            }
            if ($authUser->role?->code === 'vp_admin') {
                return Response::allow();
            }
            return $authUser->hasPermission('delete-role')
                ? Response::allow()
                : Response::deny('You do not have permission to delete roles.');
        });

        Gate::define('delete-users', function (User $authUser, User $targetUser) {
            if (in_array($targetUser->role?->code, ['superuser', 'vp_admin', 'pmo_head'], true)) {
                return false;
            }
            if ($authUser->id === $targetUser->id) {
                return false;
            }
            if ($authUser->role?->code === 'superuser') {
                return true;
            }
            if ($authUser->role?->code === 'vp_admin') {
                return true;
            }
            return $authUser->hasPermission('delete-users');
        });
    }
}
