<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $newPassword;

    public function __construct($newPassword)
    {
        $this->newPassword = $newPassword;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Your Password Has Been Reset')
            ->greeting("Hello {$notifiable->name},")
            ->line('Your account password has been reset by the administrator.')
            ->line("Here is your new password: **{$this->newPassword}**")
            ->line('For security, please log in and change this password as soon as possible.')
            ->salutation('Thank you, Property Management System');
    }
}
