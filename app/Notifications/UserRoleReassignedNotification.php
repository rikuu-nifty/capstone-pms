<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserRoleReassignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public string $oldRoleName,
        public string $newRoleName,
        public ?string $notes = null
    ) {}

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
        // $mail = (new MailMessage)
        //     ->subject('Your account role has been updated')
        //     ->greeting('Hi ' . $notifiable->name . ',')
        //     ->line("Your system role has been changed.")
        //     ->line("Previous Role: {$this->oldRoleName}")
        //     ->line("New Role: {$this->newRoleName}")
        //     ->action('Go to System', url('/'))
        //     ->line('If you believe this change is incorrect, please contact the administrator.');

        // if ($this->notes) {
        //     $mail->line('Notes: ' . $this->notes);
        // }

        // return $mail;
        
        $url = url('/');

        return (new MailMessage)
            ->subject('Your Account Role Has Been Updated')
            ->view('emails.user-role-reassigned', [
                'name'        => $notifiable->name,
                'oldRoleName' => $this->oldRoleName,
                'newRoleName' => $this->newRoleName,
                'notes'       => $this->notes,
                'url'         => $url,
            ]);
    }

    /**
     * Get the array representation of the notification (for database).
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title'      => 'Role reassigned',
            'message'    => "Your role has been updated from {$this->oldRoleName} to {$this->newRoleName}.",
            'notes'      => $this->notes,
            'link'       => url('/'),
        ];
    }
}
