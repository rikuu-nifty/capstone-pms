<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Log;
use App\Services\ResendMailer;

class RequestEmailChangeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Channels — store in DB and send manually via ResendMailer.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Database payload (for in-app notifications).
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title'   => 'Request to Update Email Address',
            'message' => 'Please update your registered email address for the Property Management System.',
            'link'    => url('/profile/settings'),
        ];
    }

    /**
     * Send email manually through ResendMailer.
     */
    public function toMailCustom(object $notifiable): void
    {
        try {
            $html = View::make('emails.request-email-change', [
                'name' => $notifiable->name,
                'url'  => url('/profile/settings'),
            ])->render();

            $ok = ResendMailer::send(
                $notifiable->email,
                'Request to Update Your Email Address',
                $html
            );

            if ($ok) {
                Log::info('✅ RequestEmailChangeNotification email sent via Resend', [
                    'email' => $notifiable->email,
                ]);
            } else {
                Log::warning('⚠️ RequestEmailChangeNotification failed to send', [
                    'email' => $notifiable->email,
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('❌ Failed to send RequestEmailChangeNotification', [
                'email' => $notifiable->email ?? 'unknown',
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Trigger email after database notification commit.
     */
    public function afterCommit(): void
    {
        try {
            if (property_exists($this, 'notifiable') && $this->notifiable) {
                $this->toMailCustom($this->notifiable);
            }
        } catch (\Throwable $e) {
            Log::error('❌ RequestEmailChangeNotification.afterCommit error', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
