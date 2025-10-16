<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;                 
use Illuminate\Notifications\Messages\MailMessage;        
use Illuminate\Notifications\Notification;

class UserRoleReassignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $oldRoleName,
        public string $newRoleName,
        public ?string $notes = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Account Role Has Been Updated')
            ->view('emails.user-role-reassigned', [
                'name'        => $notifiable->name,
                'oldRoleName' => $this->oldRoleName,
                'newRoleName' => $this->newRoleName,
                'notes'       => $this->notes,
                'url'         => url('/'),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title'   => 'Role reassigned',
            'message' => "Your role has been updated from {$this->oldRoleName} to {$this->newRoleName}.",
            'notes'   => $this->notes,
            'link'    => url('/'),
        ];
    }
}
