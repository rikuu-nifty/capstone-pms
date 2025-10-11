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
        $url = url('/login'); // or your actual login route

        return (new MailMessage)
            ->subject('Your Password Has Been Reset')
            ->view('emails.password-reset', [
                'name'        => $notifiable->name,
                'newPassword' => $this->newPassword,
                'url'         => $url,
            ]);
    }
}
