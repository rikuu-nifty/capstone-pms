<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RequestEmailChangeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Request to Update Your Email Address')
            ->greeting("Hello {$notifiable->name},")
            ->line('Please update your registered email address for the Property Management Office System.')
            ->action('Update Email', url('/profile/settings')) // change this to your email update route
            ->line('If you did not request this change, please ignore this message.');
    }
}
