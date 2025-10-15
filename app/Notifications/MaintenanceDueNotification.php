<?php

namespace App\Notifications;

use App\Models\InventoryList;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;        
use Illuminate\Notifications\Messages\MailMessage; 
use Illuminate\Notifications\Notification;

class MaintenanceDueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $asset;

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
        return (new MailMessage)
            ->subject("Maintenance Due: {$this->asset->asset_name}")
            ->view('emails.maintenance-due', [
                'name'       => $notifiable->name,
                'asset_name' => $this->asset->asset_name,
                'due_date'   => optional($this->asset->maintenance_due_date)->format('F j, Y'),
                'url'        => route('inventory-list.view', $this->asset->id),
            ]);
    }

    /**
     * Keep in-app (database) notification for the bell icon.
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
}
