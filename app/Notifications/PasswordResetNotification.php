<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Log;
use App\Services\ResendMailer;

class PasswordResetNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $newPassword;

    public function __construct(string $newPassword)
    {
        $this->newPassword = $newPassword;
    }

    /**
     * Channels — we’ll store in DB and send email manually via ResendMailer.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Save to database for in-app notifications.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title'   => 'Password Reset Successful',
            'message' => 'Your password has been reset successfully.',
            'link'    => url('/login'),
        ];
    }

    /**
     * Send password reset email via ResendMailer.
     */
    public function toMailCustom(object $notifiable): void
    {
        try {
            $html = View::make('emails.password-reset', [
                'name'        => $notifiable->name,
                'newPassword' => $this->newPassword,
                'url'         => url('/login'),
            ])->render();

            $ok = ResendMailer::send(
                $notifiable->email,
                'Your Password Has Been Reset',
                $html
            );

            if ($ok) {
                Log::info('✅ PasswordResetNotification email sent via Resend', [
                    'email' => $notifiable->email,
                ]);
            } else {
                Log::warning('⚠️ PasswordResetNotification failed to send', [
                    'email' => $notifiable->email,
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('❌ Failed to send PasswordResetNotification', [
                'email' => $notifiable->email ?? 'unknown',
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send email after DB commit (even if queued).
     */
    public function afterCommit(): void
    {
        try {
            if (property_exists($this, 'notifiable') && $this->notifiable) {
                $this->toMailCustom($this->notifiable);
            }
        } catch (\Throwable $e) {
            Log::error('❌ PasswordResetNotification.afterCommit error', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
