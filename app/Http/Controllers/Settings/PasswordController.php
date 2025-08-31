<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

use App\Models\User;

use App\Notifications\PasswordResetNotification;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/password');
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back();
    }

    public function adminReset(Request $request, User $user): RedirectResponse
    {
        // $this->authorize('reset-user-password', $user);

        $newPassword = Str::random(12);

        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        // Notify user by email
        $user->notify(new PasswordResetNotification($newPassword));

        return back()->with('status', "Password for {$user->email} has been reset and emailed.");
    }
}
