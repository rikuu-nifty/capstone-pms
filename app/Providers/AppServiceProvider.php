<?php

namespace App\Providers;

use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
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
        Inertia::share([
            // ✅ Your existing nav metrics
            'nav_metrics' => fn () =>
                Cache::remember('nav_metrics', 30, fn () => [
                    'pending_user_approvals' => User::where('status', 'pending')->count(),
                ]),

            // ✅ Add auth info for all pages
            'auth' => fn () => [
                'user' => Auth::user(),
                'isAuthenticated' => Auth::check(),
            ],
        ]);
    }
}
