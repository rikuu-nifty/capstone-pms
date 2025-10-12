<?php

namespace App\Http\Middleware;

use Inertia\Inertia;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

use App\Models\User;
use App\Models\UserDetail;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        try {
            return parent::version($request) ?? 'dev';
        } catch (\Throwable $e) {
            return 'dev';
        }
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(\Illuminate\Foundation\Inspiring::quotes()->random())->explode('-');

        // ✅ Always reload the user's related detail + role + permissions + department
        $user = $request->user()?->loadMissing(['detail', 'role.permissions', 'unitOrDepartment']);

        return [
            ...parent::share($request),

            // ---------- APP METADATA ----------
            'name' => config('app.name'),
            'quote' => [
                'message' => trim($message),
                'author'  => trim($author),
            ],

            // ---------- AUTH SHARED DATA ----------
            'auth' => [
                'user' => $user ? [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,

                    // ✅ Role details embedded directly for frontend access
                    'role' => $user->role ? [
                        'id'   => $user->role->id,
                        'name' => $user->role->name,
                        'code' => $user->role->code,
                    ] : null,

                    // ✅ Avatar with S3 + local support
                    'avatar' => $user->detail?->image_path
                        ? (
                            str_starts_with($user->detail->image_path, 'http')
                                ? $user->detail->image_path
                                : (
                                    config('filesystems.default') === 's3'
                                        ? 'https://' . env('AWS_BUCKET') . '.s3.' . env('AWS_DEFAULT_REGION') . '.amazonaws.com/' . ltrim($user->detail->image_path, '/')
                                        : asset('storage/' . ltrim($user->detail->image_path, '/'))
                                  )
                          )
                        : asset('images/default-avatar.png'),
                ] : null,

                // ✅ Permissions, role code, and department data
                'permissions' => $user?->role?->permissions?->pluck('code')->toArray() ?? [],
                'role' => $user?->role?->code,
                'unit_or_department_id' => $user?->unit_or_department_id,
                'unit_or_department' => $user?->unitOrDepartment?->only(['id', 'name', 'code']),
            ],

            // ---------- ZIGGY ROUTES ----------
            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],

            // ---------- SIDEBAR STATE ----------
            'sidebarOpen' => ! $request->hasCookie('sidebar_state')
                || $request->cookie('sidebar_state') === 'true',

            // ---------- APP METRICS ----------
            'metrics' => [
                'pending_user_count' => fn () => \App\Models\User::where('status', 'pending')->count(),
            ],

            // ---------- FLASH MESSAGES ----------
            'flash' => [
                'unauthorized' => fn() => $request->session()->has('unauthorized')
                    ? [
                        'message' => $request->session()->get('unauthorized'),
                        'time'    => now()->timestamp,
                    ]
                    : null,
            ],
        ];
    }
}
