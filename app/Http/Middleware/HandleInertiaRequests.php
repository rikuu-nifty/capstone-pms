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
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        try {
            // parent::version() will try to read your mix-manifest.json or vite manifest
            return parent::version($request) ?? 'dev';
        } catch (\Throwable $e) {
            return 'dev'; // 👈 always a fallback
        }
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
   public function share(Request $request): array
{
    [$message, $author] = str(\Illuminate\Foundation\Inspiring::quotes()->random())->explode('-');

    // ✅ Always reload the user's related detail (fresh data every request)
    $user = $request->user()?->loadMissing('detail', 'role.permissions', 'unitOrDepartment');

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

                // ✅ Always resolve avatar to a full public URL (handles S3, local, or absolute)
                'avatar' => $user->detail?->image_path
                    ? (
                        str_starts_with($user->detail->image_path, 'http')
                            ? $user->detail->image_path
                            : (
                                config('filesystems.default') === 's3'
                                    // 🟦 S3 public URL
                                    ? 'https://' . env('AWS_BUCKET') . '.s3.' . env('AWS_DEFAULT_REGION') . '.amazonaws.com/' . ltrim($user->detail->image_path, '/')
                                    // 🟩 Local fallback (for dev)
                                    : asset('storage/' . ltrim($user->detail->image_path, '/'))
                              )
                      )
                    // 🩶 Default avatar image
                    : asset('images/default-avatar.png'),
            ] : null,

            // ✅ Permissions, roles, and department data
            'permissions' => $user?->role?->permissions->pluck('code')->toArray() ?? [],
            'role' => $user?->role?->code,
            'unit_or_department_id' => $user?->unit_or_department_id,
            'unit_or_department' => $user?->unitOrDepartment?->only(['id', 'name', 'code']),
        ],

        // ---------- ZIGGY ROUTES ----------
        'ziggy' => fn(): array => [
            ...(new \Tighten\Ziggy\Ziggy)->toArray(),
            'location' => $request->url(),
        ],

        // ---------- SIDEBAR STATE ----------
        'sidebarOpen' => ! $request->hasCookie('sidebar_state')
            || $request->cookie('sidebar_state') === 'true',

        // ---------- APP METRICS (lazy evaluation) ----------
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

        // ---------- DEBUG (optional - can remove later) ----------
        // 'debug_avatar' => $user?->detail?->image_path,
    ];
}


}
