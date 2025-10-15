<?php

namespace App\Notifications;

use App\Models\InventoryList;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;        
use Illuminate\Notifications\Messages\MailMessage; 
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;

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
        $due = $this->asset->maintenance_due_date
            ? Carbon::parse($this->asset->maintenance_due_date)
            : null;

        $today = Carbon::today();
        $isOverdue = $due && $due->lessThan($today);

        $formattedDue = $due
            ? $due->timezone(config('app.timezone'))->format('F j, Y')
            : 'Not specified';

        $daysOverdue = $isOverdue ? $due->diffInDays($today) : 0;

        $subject = $isOverdue
            ? "Maintenance OVERDUE: {$this->asset->asset_name}"
            : "Maintenance Due: {$this->asset->asset_name}";

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.maintenance-due', [
                'name'         => $notifiable->name,
                'asset_name'   => $this->asset->asset_name,
                'due_date'     => $formattedDue,
                'url'          => route('inventory-list.view', $this->asset->id),
                'is_overdue'   => $isOverdue,
                'days_overdue' => $daysOverdue,
            ]);
    }

    /**
     * Keep in-app (database) notification for the bell icon.
     */
    public function toArray(object $notifiable): array
    {
        $due = $this->asset->maintenance_due_date
            ? Carbon::parse($this->asset->maintenance_due_date)
            : null;

        $today = Carbon::today();
        $isOverdue = $due && $due->lessThan($today);
        $dueStr = $due ? $due->toDateString() : null;

        return [
            'asset_id'            => $this->asset->id,
            'asset_name'          => $this->asset->asset_name,
            'maintenance_due_date' => $dueStr,
            'title'               => $isOverdue ? 'Maintenance Overdue' : 'Maintenance Due Reminder',
            'message'             => $isOverdue
                ? "Maintenance for {$this->asset->asset_name} is OVERDUE (due on {$dueStr})."
                : "Maintenance for {$this->asset->asset_name} is due on {$dueStr}.",
            'link'                => route('inventory-list.view', $this->asset->id),
        ];
    }
}
