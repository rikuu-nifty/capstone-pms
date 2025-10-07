<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
// use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Carbon\Carbon;

class OverdueNotification extends Notification
{
    use Queueable;

    protected $message;
    protected $dueDate;
    protected $relatedId;
    protected $module;

    /**
     * Create a new notification instance.
     *
     * @param  string  $message
     * @param  string|null  $dueDate
     * @param  int|string  $relatedId
     * @param  string  $module
     * @return void
     */
    public function __construct($message, $dueDate, $relatedId, $module)
    {
        $this->message = $message;
        $this->dueDate = $dueDate;
        $this->relatedId = $relatedId;
        $this->module = $module;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  object  $notifiable
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database']; // store in notifications table
    }

    /**
     * Get the database representation of the notification.
     *
     * @param  object  $notifiable
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        // Format module name nicely for display
        $formattedModule = match ($this->module) {
            'property_transfer'    => 'Property Transfer',
            'inventory_scheduling' => 'Inventory Scheduling',
            'off_campus'           => 'Off-Campus',
            'maintenance'          => 'Maintenance',
            default                => ucwords(str_replace('_', ' ', $this->module)),
        };

        return [
            'asset_id'   => $this->relatedId,
            'asset_name' => "{$formattedModule} #{$this->relatedId}",
            'maintenance_due_date' => $this->dueDate
                ? \Carbon\Carbon::parse($this->dueDate)->format('F j, Y')
                : null,
            'message' => $this->message,
            'module'  => $this->module,
            'status'  => 'unread',
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  object  $notifiable
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => $this->message,
            'due_date' => $this->dueDate,
            'related_id' => $this->relatedId,
            'module' => $this->module,
        ];
    }
}
