<?php

namespace App\Notifications;

use App\Models\InventoryList;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;            // Queue for reliability
use Illuminate\Notifications\Messages\MailMessage;     // Native mail channel
use Illuminate\Notifications\Notification;
use Carbon\Carbon;                                     // For date math

class MaintenanceOverdueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected InventoryList $asset;

    public function __construct(InventoryList $asset)
    {
        $this->asset = $asset;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        // Compute formatted due date and days overdue (safe if null)
        $due = $this->asset->maintenance_due_date
            ? Carbon::parse($this->asset->maintenance_due_date)
            : null;

        $formattedDue = $due?->format('F j, Y') ?? 'Not specified';

        // If date exists and is in the past => positive days overdue
        $daysOverdue = $due ? $due->diffInDays(Carbon::now(), false) : 0; // negative if future
        $daysOverdue = max(0, $daysOverdue); // force >= 0

        return (new MailMessage)
            ->subject("Maintenance OVERDUE: {$this->asset->asset_name}")
            ->view('emails.maintenance-overdue', [   // Render your Blade directly
                'name'         => $notifiable->name,
                'asset_name'   => $this->asset->asset_name,
                'due_date'     => $formattedDue,
                'days_overdue' => $daysOverdue,
                'url'          => route('inventory-list.view', $this->asset->id),
            ]);
    }

    /**
     * In-app (database) notification payload for your bell center
     */
    public function toArray(object $notifiable): array
    {
        return [
            'asset_id'            => $this->asset->id,
            'asset_name'          => $this->asset->asset_name,
            'maintenance_due_date' => $this->asset->maintenance_due_date,
            'title'               => 'Maintenance Overdue',
            'message'             => "Maintenance for {$this->asset->asset_name} is OVERDUE.",
            'link'                => route('inventory-list.view', $this->asset->id),
        ];
    }
}
