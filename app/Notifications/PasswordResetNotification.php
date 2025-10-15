<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\View;

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
        // ✅ Render Blade view normally
        $html = View::make('emails.password-reset', [
            'name'        => $notifiable->name,
            'newPassword' => $this->newPassword,
            'url'         => url('/login'),
        ])->render();

        // ✅ Get image from S3 (in memory)
        $s3 = Storage::disk('s3');
        $path = 'logo_image/email-logo.png';
        $contents = $s3->get($path);

        // ✅ Send the message using inline attachment
        return (new MailMessage)
            ->subject('Your Password Has Been Reset')
            ->view('emails.password-reset', [
                'name'        => $notifiable->name,
                'newPassword' => $this->newPassword,
                'url'         => url('/login'),
            ])
            ->withSymfonyMessage(function ($message) use ($contents) {
                $message->embedData($contents, 'email-logo.png', 'image/png');
                // This assigns a Content-ID automatically based on filename
            });
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
