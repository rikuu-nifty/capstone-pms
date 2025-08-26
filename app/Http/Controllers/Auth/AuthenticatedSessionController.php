<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
        // public function store(LoginRequest $request): RedirectResponse
        // {
        //     $request->authenticate();
        //     $request->session()->regenerate();

        //     // return redirect()->intended(route('dashboard', absolute: false));
        //     // return redirect()->intended(route('dashboard'));

        //     // If login request has ?redirect=, honor it
        // if ($request->has('redirect')) {
        //     return redirect($request->input('redirect'));
        // }

        // // Otherwise fallback to intended or dashboard
        // return redirect()->intended(route('dashboard'));
        // }

        public function store(LoginRequest $request): RedirectResponse
{
    $request->authenticate();
    $request->session()->regenerate();

    // ✅ use validated data
    $redirect = $request->validated()['redirect'] ?? null;

    if ($redirect) {
        return redirect()->to($redirect);
    }

    return redirect()->intended(route('dashboard'));
}


    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
