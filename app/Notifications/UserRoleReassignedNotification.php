<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Log;
use App\Services\ResendMailer;

class UserRoleReassignedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $oldRoleName,
        public string $newRoleName,
        public ?string $notes = null
    ) {}

    public function via(object $notifiable): array
    {
        Log::info('🔔 via() entered for UserRoleReassignedNotification', [
            'email' => $notifiable->email ?? null,
        ]);

        $this->sendEmailNow($notifiable);   // fire synchronously
        return ['database'];                // still store DB notif
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

    protected function sendEmailNow(object $notifiable): void
    {
        try {
            $html = View::make('emails.user-role-reassigned', [
                'name'        => $notifiable->name,
                'oldRoleName' => $this->oldRoleName,
                'newRoleName' => $this->newRoleName,
                'notes'       => $this->notes,
                'url'         => url('/'),
            ])->render();

            ResendMailer::send(
                $notifiable->email,
                'Your Account Role Has Been Updated',
                $html
            );

            Log::info("✅ UserRoleReassignedNotification email sent via Resend", [
                'email' => $notifiable->email,
            ]);
        } catch (\Throwable $e) {
            Log::error("❌ Failed to send UserRoleReassignedNotification", [
                'email' => $notifiable->email ?? 'unknown',
                'error' => $e->getMessage(),
            ]);
        }
    }
}
