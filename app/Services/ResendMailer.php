<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;

class ResendMailer
{
    /**
     * Send a plain text email via Laravel Mail (SMTP).
     */
    public static function send(string $to, string $subject, string $body, ?string $from = null): void
    {
        $fromAddress = $from ?? config('mail.from.address');
        $fromName = config('mail.from.name');

        Mail::raw($body, function ($message) use ($to, $subject, $fromAddress, $fromName) {
            $message->to($to)
                ->subject($subject)
                ->from($fromAddress, $fromName);
        });
    }

    /**
     * Send an HTML email (optional if you later use Mailable classes).
     */
public static function sendHtml(string $to, string $subject, string $html, ?string $from = null): void
{
    $fromAddress = $from ?? config('mail.from.address');
    $fromName = config('mail.from.name');

    try {
        // ✅ Uses Laravel's built-in method that explicitly sets Content-Type: text/html
        Mail::html($html, function ($message) use ($to, $subject, $fromAddress, $fromName) {
            $message->to($to)   
                ->subject($subject)
                ->from($fromAddress, $fromName);
        });
    } catch (\Throwable $e) {
        \Log::error('❌ Failed to send HTML email via ResendMailer', [
            'to' => $to,
            'subject' => $subject,
            'error' => $e->getMessage(),
        ]);
    }
}

}
