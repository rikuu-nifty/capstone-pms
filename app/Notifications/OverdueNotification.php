<?php

namespace App\Notifications;

use App\Models\InventoryList;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;           
use Illuminate\Notifications\Messages\MailMessage;     
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;                                     

class OverdueNotification extends Notification implements ShouldQueue
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
        $due = $this->asset->maintenance_due_date
            ? Carbon::createFromFormat('Y-m-d', (string) $this->asset->maintenance_due_date)
            : null;

        $formattedDue = $due
            ? $due->timezone(config('app.timezone'))->format('F j, Y')
            : 'Not specified';

        // If date exists and is in the past => positive days overdue
        $daysOverdue = $due ? $due->diffInDays(Carbon::now(), false) : 0;
        $daysOverdue = max(0, $daysOverdue);

        return (new MailMessage)
            ->subject("Maintenance OVERDUE: {$this->asset->asset_name}")
            ->view('emails.maintenance-overdue', [
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
        $dueStr = $this->asset->maintenance_due_date
            ? (string) $this->asset->maintenance_due_date
            : null;
            
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
