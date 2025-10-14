<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\View;

class UserApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public ?string $notes = null) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = url('/dashboard');

        // ✅ Render Blade into full HTML string before passing to MailMessage
        $html = View::make('emails.user-approved', [
            'name'  => $notifiable->name,
            'notes' => $this->notes,
            'url'   => $url,
        ])->render();

        return (new MailMessage)
            ->subject('Your Account Has Been Approved')
            ->html($html); // ✅ send as HTML
    }

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
