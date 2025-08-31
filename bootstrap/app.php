<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

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
        $exceptions->render(function (AuthorizationException|HttpException $e, $request) {
            $status = $e instanceof HttpException ? $e->getStatusCode() : 403;

            if ($status === 403) {
                $message = $e->getMessage() ?: 'You are not authorized to perform this action.';

                // Inertia navigation → bounce back with flash
                if ($request->inertia()) {
                    return back(303)->with('unauthorized', $message);
                }

                // Non-Inertia (direct visit, hard refresh) → redirect somewhere safe
                return redirect()
                    ->route('unauthorized')   // optional: make a route/page for non-Inertia users
                    ->with('unauthorized', $message);
            }

            return null; // let Laravel handle other errors normally
        });
    })
    ->create();
