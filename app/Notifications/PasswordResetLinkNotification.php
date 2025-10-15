<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;                 
use Illuminate\Notifications\Messages\MailMessage;          
use Illuminate\Notifications\Notification;

class PasswordResetLinkNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(protected string $resetUrl) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Reset Your Password')                
            ->view('emails.password-reset', [               
                'name'        => $notifiable->name,
                'url'         => $this->resetUrl,
                'newPassword' => null,                      
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title'   => 'Password Reset Requested',
            'message' => 'A password reset link has been sent to your email.',
            'link'    => $this->resetUrl,
        ];
    }
}
