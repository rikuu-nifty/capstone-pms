<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;

class EmailOtpService
{
    /**
     * Send a One-Time Password (OTP) to the given email.
     */
    public static function sendOtp(string $email, string $otp): void
    {
        $subject = 'Your Tap & Track Verification Code';
        $body = "Hi,\n\nYour verification code is: {$otp}\n\nThis code will expire in 10 minutes.\n\nProperty Management System (Tap & Track)";

        Mail::raw($body, function ($message) use ($email, $subject) {
            $message->to($email)
                ->subject($subject)
                ->from(config('mail.from.address'), config('mail.from.name'));
        });
    }
}
