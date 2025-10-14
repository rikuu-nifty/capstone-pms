<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\EmailVerificationCode; // <-- import missing model
use App\Services\EmailOtpService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmailOtpController extends Controller
{
    private const PENDING_KEY = 'pending_verification_user_id';

    // Show OTP page for the "pending" user (guest)
    public function showGuest(Request $request, EmailOtpService $otpService)
    {
        $userId = $request->session()->get(self::PENDING_KEY);
        if (!$userId) {
            return redirect()->route('login')->with('status', 'Please log in or register first.');
        }

        $user = User::find($userId);
        if (!$user) {
            // user was deleted
            $request->session()->forget(self::PENDING_KEY);
            return redirect()->route('register')->withErrors(['email' => 'Your registration needs to be restarted.']);
        }

        // Auto-issue a fresh OTP if none active (optional)
        $hasActive = $user->emailVerificationCodes()
            ->whereNull('consumed_at')
            ->where('expires_at', '>', now())
            ->exists();

        if (!$hasActive) {
            $otpService->issue($user, $request->ip(), $request->userAgent());
        }

        // ⚠️ Adjust the case/path to match your actual TSX file
        return Inertia::render('auth/verify-emailOTP', [
            'email' => $user->email,
            'resendCooldownSec' => 60,
        ]);
    }

    // Resend (guest)
    public function resendGuest(Request $request, EmailOtpService $otpService)
    {
        $userId = $request->session()->get(self::PENDING_KEY);
        if (!$userId) {
            return back()->withErrors(['code' => 'Session expired. Please register again.']);
        }

        $user = User::find($userId);
        if (!$user) {
            $request->session()->forget(self::PENDING_KEY);
            return redirect()->route('register')->withErrors(['email' => 'Your registration needs to be restarted.']);
        }

        $otpService->issue($user, $request->ip(), $request->userAgent());
        return back()->with('status', 'Verification code resent.');
    }

    // Verify (guest). After success, DO NOT auto-login—send to login page.
    public function verifyGuest(Request $request, EmailOtpService $otpService)
    {
        $data = $request->validate(['code' => ['required','digits:6']]);

        $userId = $request->session()->get(self::PENDING_KEY); // <-- use constant
        if (!$userId) {
            return back()->withErrors(['code' => 'Session expired. Click Resend or Register again.']);
        }

        $user = User::find($userId);
        if (!$user) {
            $request->session()->forget(self::PENDING_KEY);
            return redirect()->route('register')->withErrors(['email' => 'Please register again.']);
        }

        // Pre-check WHY it might fail (better messages during testing)
        $record = EmailVerificationCode::where('user_id', $user->id)
            ->whereNull('consumed_at')
            ->latest('id')
            ->first();

        if (!$record) {
            return back()->withErrors(['code' => 'No active code. Click Resend.']);
        }
        if (now()->gt($record->expires_at)) {
            return back()->withErrors(['code' => 'Code expired. Click Resend.']);
        }
        if ($record->attempts >= $record->max_attempts) {
            return back()->withErrors(['code' => 'Too many attempts. Click Resend.']);
        }

        // Now check actual match
        if (!$otpService->verify($user, $data['code'])) {
            return back()->withErrors(['code' => 'Incorrect code.']);
        }

        // Success
        $user->forceFill(['email_verified_at' => now()])->save();
        $request->session()->forget(self::PENDING_KEY);

        return redirect()->route('login')->with('status', 'Email verified. Please log in.');
    }
}