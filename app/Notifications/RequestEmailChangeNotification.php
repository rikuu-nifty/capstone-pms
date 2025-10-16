<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;                 
use Illuminate\Notifications\Messages\MailMessage;         
use Illuminate\Notifications\Notification;

class RequestEmailChangeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Request to Update Your Email Address')
            ->view('emails.request-email-change', [
                'name' => $notifiable->name,
                'url'  => url('/profile/settings'),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title'   => 'Request to Update Email Address',
            'message' => 'Please update your registered email address for the Property Management System.',
            'link'    => url('/profile/settings'),
        ];
    }
}
