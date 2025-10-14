<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class ResendMailer
{
    public static function send(string $to, string $subject, string $html): bool
    {
        try {
            $apiKey = env('RESEND_API_KEY');
            $fromName = config('mail.from.name', 'Property Management System');
            $fromAddress = config('mail.from.address', 'aufpmo@tapandtrack.online');

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type'  => 'application/json',
            ])->post('https://api.resend.com/emails', [
                'from'    => "{$fromName} <{$fromAddress}>", // ✅ Proper display name
                'to'      => [$to],
                'subject' => $subject,
                'html'    => $html,
            ]);

            if ($response->successful()) {
                Log::info("✅ Resend email sent to {$to} ({$subject})");
                return true;
            }

            Log::error('❌ Resend API error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return false;

        } catch (\Throwable $e) {
            Log::error('❌ ResendMailer exception', [
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
