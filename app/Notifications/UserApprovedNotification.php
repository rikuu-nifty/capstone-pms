<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserApprovedNotification extends Notification implements ShouldQueue
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
        $url = url('/dashboard');

        // $mail = (new MailMessage)
        //     ->subject('Your account has been approved')
        //     ->greeting('Hi '.$notifiable->name.',')
        //     ->line('Good news! Your account has been approved.')
        //     ->action('Go to Dashboard', url('/dashboard'))
        //     ->line('You can now sign in and start using the system.');

        // if ($this->notes) {
        //     $mail->line('Notes: '.$this->notes);
        // }

        // return $mail;
        return (new MailMessage)
        ->subject('Your Account Has Been Approved')
        ->view('emails.user-approved', [
            'name' => $notifiable->name,
            'notes' => $this->notes,
            'url' => $url,
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
            'title'   => 'Account approved',
            'message' => 'Your account has been approved.',
            'notes'   => $this->notes,
            'link'    => url('/dashboard'),
        ];
    }
}
