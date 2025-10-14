<?php

namespace App\Notifications;

use App\Models\InventoryList;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Log;
use App\Services\ResendMailer;
use Carbon\Carbon;

class MaintenanceDueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $asset;

    /**
     * Create a new notification instance.
     */
    public function __construct(InventoryList $asset)
    {
        $this->asset = $asset;
    }

    /**
     * Deliver channels — store in DB, send email manually via Resend.
     */
    public function via(object $notifiable): array
    {
        return ['database']; // Email handled manually below
    }

    /**
     * Store database notification (for bell icon).
     */
    public function toArray(object $notifiable): array
    {
        return [
            'asset_id'   => $this->asset->id,
            'asset_name' => $this->asset->asset_name,
            'maintenance_due_date' => $this->asset->maintenance_due_date,
            'title'      => 'Maintenance Due Reminder',
            'message'    => "Maintenance for {$this->asset->asset_name} is due on {$this->asset->maintenance_due_date}.",
            'link'       => route('inventory-list.view', $this->asset->id),
        ];
    }

    /**
     * Send via Resend API manually (not queue-dependent).
     */
    public function toMailCustom(object $notifiable): void
    {
        try {
            $formattedDate = $this->asset->maintenance_due_date
            ? Carbon::parse($this->asset->maintenance_due_date)->format('F j, Y')
            : 'Not specified';
            $url = route('inventory-list.view', $this->asset->id);

            // 🔹 Render Blade email template
            $html = View::make('emails.maintenance-due', [
                'name'       => $notifiable->name,
                'asset_name' => $this->asset->asset_name,
                'due_date'   => $formattedDate,
                'url'        => $url,
            ])->render();

            // 🔹 Send using reusable ResendMailer service
            $ok = ResendMailer::send(
                $notifiable->email,
                "Maintenance Due: {$this->asset->asset_name}",
                $html
            );

            if ($ok) {
                Log::info('✅ MaintenanceDueNotification email sent via Resend', [
                    'email' => $notifiable->email,
                    'asset' => $this->asset->asset_name,
                ]);
            } else {
                Log::warning('⚠️ MaintenanceDueNotification email failed', [
                    'email' => $notifiable->email,
                    'asset' => $this->asset->asset_name,
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('❌ MaintenanceDueNotification Resend error', [
                'email' => $notifiable->email ?? 'unknown',
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Automatically send after notification is committed to DB.
     */
    public function afterCommit(): void
    {
        try {
            if (property_exists($this, 'notifiable') && $this->notifiable) {
                $this->toMailCustom($this->notifiable);
            }
        } catch (\Throwable $e) {
            Log::error('❌ MaintenanceDueNotification.afterCommit error', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
