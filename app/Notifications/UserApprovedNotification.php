<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Log;
use App\Services\ResendMailer;

class UserApprovedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public ?string $notes = null) {}

    /**
     * Channels: send instantly (no queue) and store in DB.
     */
    public function via(object $notifiable): array
    {
        // 🔹 Send instantly via Resend before storing in database
        $this->sendEmailNow($notifiable);
        return ['database'];
    }

    /**
     * Store the notification in the database.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title'   => 'Account Approved',
            'message' => 'Your account has been approved.',
            'notes'   => $this->notes,
            'link'    => url('/dashboard'),
        ];
    }

    /**
     * Send email immediately through ResendMailer.
     */
    protected function sendEmailNow(object $notifiable): void
    {
        try {
            $html = View::make('emails.user-approved', [
                'name'  => $notifiable->name,
                'notes' => $this->notes,
                'url'   => url('/dashboard'),
            ])->render();

            ResendMailer::send(
                $notifiable->email,
                'Your Account Has Been Approved',
                $html
            );

            Log::info("✅ UserApprovedNotification email sent via Resend", [
                'email' => $notifiable->email,
            ]);
        } catch (\Throwable $e) {
            Log::error("❌ Failed to send UserApprovedNotification", [
                'email' => $notifiable->email ?? 'unknown',
                'error' => $e->getMessage(),
            ]);
        }
    }
}
