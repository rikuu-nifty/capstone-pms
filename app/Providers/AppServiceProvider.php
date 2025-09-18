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

        // ✅ Existing nav metrics
        Inertia::share('nav_metrics', function () {
            return Cache::remember('nav_metrics', 30, function () {
                return [
                    'pending_user_approvals' => User::where('status', 'pending')->count(),
                ];
            });
        });

        // ✅ Notifications (all + unread count)
        Inertia::share('notifications', function () {
            $user = auth()->user();

            return $user
                ? [
                    'items' => $user->notifications()->latest()->take(10)->get(),
                    'unread_count' => $user->unreadNotifications()->count(),
                ]
                : [
                    'items' => [],
                    'unread_count' => 0,
                ];
        });
      
    }
}
