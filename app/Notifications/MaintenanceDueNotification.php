<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\InventoryList;
use Carbon\Carbon;

use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Mail;

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
        $url = route('inventory-list.view', $this->asset->id);

        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject("Maintenance Due: {$this->asset->asset_name}")
            ->view('emails.maintenance-due', [
                'name'       => $notifiable->name,
                'asset_name' => $this->asset->asset_name,
                'due_date'   => $formattedDate,
                'url'        => $url,
            ]);
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
