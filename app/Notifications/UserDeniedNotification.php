<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Log;
use App\Services\ResendMailer;

class UserDeniedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public ?string $notes = null) {}

    /**
     * Channels: store in DB + send instantly via Resend.
     */
    public function via(object $notifiable): array
    {
        // 🔹 Send email immediately using ResendMailer
        $this->sendEmailNow($notifiable);
        return ['database'];
    }

    /**
     * Store the notification in the database.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title'   => 'Account Denied',
            'message' => 'Your account request was denied.',
            'notes'   => $this->notes,
            'link'    => url('/'),
        ];
    }

    /**
     * Send the denial email through ResendMailer.
     */
    protected function sendEmailNow(object $notifiable): void
    {
        try {
            $html = View::make('emails.user-denied', [
                'name'  => $notifiable->name,
                'notes' => $this->notes,
                'url'   => url('/'),
            ])->render();

            ResendMailer::send(
                $notifiable->email,
                'Your Account Request Was Denied',
                $html
            );

            Log::info("✅ UserDeniedNotification email sent via Resend", [
                'email' => $notifiable->email,
            ]);
        } catch (\Throwable $e) {
            Log::error("❌ Failed to send UserDeniedNotification", [
                'email' => $notifiable->email ?? 'unknown',
                'error' => $e->getMessage(),
            ]);
        }
    }
}
