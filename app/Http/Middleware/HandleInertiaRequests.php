<?php

namespace App\Http\Middleware;

use Inertia\Inertia;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Models\User;

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
        // return parent::version($request);
        try {
            return parent::version($request);
        } catch (\Throwable $e) {
            return 'dev'; // fallback value so version is never null
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
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user()?->role?->permissions->pluck('code')->toArray() ?? [],
                'role' => $request->user()?->role?->code,
                'unit_or_department_id' => $request->user()?->unit_or_department_id,
                'unit_or_department' => $request->user()?->unitOrDepartment?->only(['id', 'name', 'code']),
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'metrics' => [
                // Lazy evaluates only if referenced on the client
                'pending_user_count' => fn () => User::where('status', 'pending')->count(),
            ],
            // 'flash' => [
            //     'unauthorized' => fn() => $request->session()->get('unauthorized'),
            // ],
            'flash' => [
                'unauthorized' => fn() => $request->session()->has('unauthorized')
                    ? [
                        'message' => $request->session()->get('unauthorized'),
                        'time'    => now()->timestamp, // 🔑 makes each flash unique
                    ]
                    : null,
            ],

        ];
    }
}
