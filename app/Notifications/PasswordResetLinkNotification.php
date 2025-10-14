<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Log;
use App\Services\ResendMailer;

class PasswordResetLinkNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(protected string $resetUrl) {}

    /**
     * Channels — store in DB and send manually via ResendMailer.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Store notification data in database.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title'   => 'Password Reset Requested',
            'message' => 'A password reset link has been sent to your email.',
            'link'    => $this->resetUrl,
        ];
    }

    /**
     * Handle HTML email sending via Resend.
     */
    public function toMailCustom(object $notifiable): void
    {
        try {
            $html = View::make('emails.password-reset', [
                'name'        => $notifiable->name,
                'url'         => $this->resetUrl,
                'newPassword' => null, // tells Blade to show "Reset Link"
            ])->render();

            $ok = ResendMailer::send(
                $notifiable->email,
                'Reset Your Password',
                $html
            );

            if ($ok) {
                Log::info('✅ PasswordResetLinkNotification email sent via Resend', [
                    'email' => $notifiable->email,
                ]);
            } else {
                Log::warning('⚠️ PasswordResetLinkNotification failed to send', [
                    'email' => $notifiable->email,
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('❌ Failed to send PasswordResetLinkNotification', [
                'email' => $notifiable->email ?? 'unknown',
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Trigger email after DB commit (even when queued).
     */
    public function afterCommit(): void
    {
        try {
            if (property_exists($this, 'notifiable') && $this->notifiable) {
                $this->toMailCustom($this->notifiable);
            }
        } catch (\Throwable $e) {
            Log::error('❌ PasswordResetLinkNotification.afterCommit error', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
