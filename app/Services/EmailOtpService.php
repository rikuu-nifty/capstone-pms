<?php

namespace App\Services;

use App\Mail\EmailOtpMail;
use App\Models\EmailVerificationCode;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EmailOtpService
{
    /**
     * Create a fresh OTP (invalidates any unconsumed one) and send it via email.
     */
    public function issue(
        User $user,
        ?string $ip = null,
        ?string $userAgent = null,
        int $ttlMinutes = 10,
        int $maxAttempts = 5
    ): void {
        // 🔹 Remove any previous active codes
        EmailVerificationCode::where('user_id', $user->id)
            ->whereNull('consumed_at')
            ->delete();

        // 🔹 Generate a secure 6-digit OTP
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // 🔹 Save new verification record
        EmailVerificationCode::create([
            'user_id'       => $user->id,
            'code_hash'     => Hash::make($otp),
            'expires_at'    => now()->addMinutes($ttlMinutes),
            'max_attempts'  => $maxAttempts,
            'attempts'      => 0,
            'sent_to_email' => $user->email,
            'ip_address'    => $ip,
            'user_agent'    => Str::limit((string) $userAgent, 255),
        ]);

        // 🔹 Send OTP email via Resend mailer
        try {
            Log::info('📨 Sending OTP via Resend', [
                'email' => $user->email,
                'otp' => $otp,
            ]);

            Mail::mailer('resend')
                ->to($user->email)
                ->send(new EmailOtpMail($user, $otp));

            Log::info('✅ OTP email sent successfully to ' . $user->email);
        } catch (\Throwable $e) {
            Log::error('❌ Failed to send OTP email', [
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Verify the provided code for the user. Consumes on success.
     * Returns true on success, false otherwise.
     */
    public function verify(User $user, string $plainCode): bool
    {
        $record = EmailVerificationCode::where('user_id', $user->id)
            ->whereNull('consumed_at')
            ->latest('id')
            ->first();

        if (!$record) {
            return false;
        }

        if (now()->greaterThan($record->expires_at)) {
            return false;
        }

        if ($record->attempts >= $record->max_attempts) {   
            return false;
        }

        // Only count attempts on WRONG code
        if (!Hash::check($plainCode, $record->code_hash)) {
            $record->increment('attempts');
            return false;
        }

        // Success → consume the code
        $record->forceFill(['consumed_at' => now()])->save();

        return true;
    }
}
