<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\InventoryList;
use Carbon\Carbon;

class MaintenanceDueNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
   public function __construct(InventoryList $asset)
    {
        $this->asset = $asset;
    }

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
     * Database payload (for bell icon).
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'asset_id'   => $this->asset->id,
            'asset_name' => $this->asset->asset_name,
            'maintenance_due_date' => $this->asset->maintenance_due_date,
            'message'    => "Maintenance due for {$this->asset->asset_name} on {$this->asset->maintenance_due_date}",
            // 'message' => "Please check this asset: {$this->asset->asset_name}.",
            'message' => "Please check {$this->asset->asset_name} — maintenance due.",
        ];
    }


    /**
     * Get the mail representation of the notification.
     */
   public function toMail(object $notifiable): MailMessage
{
    $formattedDate = Carbon::parse($this->asset->maintenance_due_date)->format('F j, Y');

    return (new MailMessage)
        ->subject("Maintenance Due: {$this->asset->asset_name}")
        ->greeting("Hello {$notifiable->name},")
        ->line("The asset **{$this->asset->asset_name}** is due for maintenance on {$formattedDate}.")
        ->action('View Asset', route('inventory-list.view', $this->asset->id))
        ->line('Please take action as soon as possible.');
}

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
