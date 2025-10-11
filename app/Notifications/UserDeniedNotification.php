<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserDeniedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public ?string $notes = null) {}
    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {

        $url = url('/');

        // $mail = (new MailMessage)
        //     ->subject('Your account request was denied')
        //     ->greeting('Hi '.$notifiable->name.',')
        //     ->line('We’re sorry—your account request was not approved.')
        //     ->line('If you believe this is an error, please reach out to the administrator.')
        //     ->action('Go to Home', url('/'))
        //     ->line('Thank you.');

        // if ($this->notes) {
        //     $mail->line('Notes: '.$this->notes);
        // }

        // return $mail;
        return (new MailMessage)
        ->subject('Your Account Request Was Denied')
        ->view('emails.user-denied', [
            'name'  => $notifiable->name,
            'notes' => $this->notes,
            'url'   => $url,
        ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title'   => 'Account denied',
            'message' => 'Your account request was denied.',
            'notes'   => $this->notes,
            'link'    => url('/'),
        ];
    }
}
