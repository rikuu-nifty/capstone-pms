<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;                
use Illuminate\Notifications\Messages\MailMessage;         
use Illuminate\Notifications\Notification;

class PasswordResetNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $newPassword;

    public function __construct(string $newPassword)
    {
        $this->newPassword = $newPassword;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Password Has Been Reset')      
            ->view('emails.password-reset', [              
                'name'        => $notifiable->name,
                'newPassword' => $this->newPassword,   
                'url'         => url('/login'),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title'   => 'Password Reset Successful',
            'message' => 'Your password has been reset successfully.',
            'link'    => url('/login'),
        ];
    }
}
