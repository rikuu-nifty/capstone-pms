<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Auth\Access\AuthorizationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        // api: __DIR__ . '/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'approved' => \App\Http\Middleware\EnsureUserApproved::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (AuthorizationException $e, $request) {
            // ✅ Inertia visit: go back with a flash so the layout can show a modal
            if ($request->inertia()) {
                return back(303)->with(
                    'unauthorized',
                    $e->getMessage() ?: 'You are not authorized to perform this action.'
                );
            }

            // ✅ Non-Inertia fallback (optional)
            return redirect()
                ->route('unauthorized')
                ->with('unauthorized', $e->getMessage() ?: 'You are not authorized to perform this action.');
        });
    })
    ->create();
