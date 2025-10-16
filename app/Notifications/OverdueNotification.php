<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

use App\Models\InventoryScheduling;
use App\Models\Transfer;

class OverdueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $type;
    protected int $recordId;
    protected ?string $scheduledDate;
    protected string $status;
    protected string $title;

    /**
     * Accepts either an InventoryScheduling or Transfer record dynamically.
     */
    public function __construct(object $record)
    {
        if ($record instanceof InventoryScheduling) {
            $this->type = 'inventory_scheduling';
            $this->recordId = $record->id;
            $this->scheduledDate = $record->inventory_schedule;
            $this->status = $record->scheduling_status;
            $this->title = "Inventory Scheduling #{$record->id}";
        } elseif ($record instanceof Transfer) {
            $this->type = 'property_transfer';
            $this->recordId = $record->id;
            $this->scheduledDate = $record->scheduled_date;
            $this->status = $record->status;
            $this->title = "Property Transfer #{$record->id}";
        } else {
            throw new \InvalidArgumentException('Invalid model type for OverdueNotification.');
        }
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        Log::info("✉️ Sending OverdueNotification for {$this->title} to {$notifiable->email}");

        // Format date and compute days overdue
        $scheduledFor = 'Not specified';
        $daysOverdue = 0;

        if ($this->type === 'inventory_scheduling' && $this->scheduledDate) {
            $end = Carbon::createFromFormat('Y-m', $this->scheduledDate)->endOfMonth(); // 'YYYY-MM' → end of that month
            $scheduledFor = $end->format('F Y');
            $daysOverdue = max(0, $end->diffInDays(now()));
        } elseif ($this->type === 'property_transfer' && $this->scheduledDate) {
            $date = Carbon::parse($this->scheduledDate); // Full date string
            $scheduledFor = $date->format('F j, Y');
            $daysOverdue = max(0, $date->diffInDays(now()));
        }

        $url = $this->type === 'inventory_scheduling'
            ? route('inventory-scheduling.show', $this->recordId)
            : route('transfers.show', $this->recordId);

        return (new MailMessage)
            ->subject("{$this->title} OVERDUE")
            ->view('emails.overdue-forms', [
                'name'          => $notifiable->name,
                'title'         => $this->title,
                'scheduled_for' => $scheduledFor,
                'days_overdue'  => $daysOverdue,
                'status'        => $this->status,
                'url'           => $url,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $link = $this->type === 'inventory_scheduling'
            ? route('inventory-scheduling.show', $this->recordId)
            : route('transfers.show', $this->recordId);

        return [
            'title'   => "{$this->title} Overdue",
            'message' => "{$this->title} has been marked as overdue.",
            'status'  => $this->status,
            'link'    => $link,
        ];
    }
}
