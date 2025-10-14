<?php

namespace App\Http\Controllers\Auth;
use App\Services\EmailOtpService;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request, EmailOtpService $otpService): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^\S+$/'],
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->letters()->mixedCase()->numbers()->symbols(),
            ],
        ], [
            'name.regex' => 'Username cannot contain spaces.',
        ]);

        $user = User::create([
            'name'              => $request->name,
            'email'             => $request->email,
            'password'          => Hash::make($request->password),
            'email_verified_at' => null, // Ensure new account is unverified
        ]);

        event(new Registered($user));
        Auth::login($user);

        // Reset the session so no old session data can bypass verification
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        $request->session()->regenerate();

        // Issue OTP and send email
        $otpService->issue($user, $request->ip(), $request->userAgent());

        // Save a "pending verification" user id in the session (guest flow)
        $request->session()->put('pending_verification_user_id', $user->id);

        // IMPORTANT: make sure we stay as guest (no Auth::login here)
        // If any session exists from before, reset it
        $request->session()->regenerate();


        // Redirect to verification page, NOT dashboard
        return redirect()->route('otp.notice');
        // return redirect()->intended(route('dashboard', absolute: false));
    }
}