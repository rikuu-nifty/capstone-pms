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
use App\Models\OffCampus;

class OverdueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $type;
    protected int $recordId;
    protected ?string $dueDate;
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
            $this->dueDate = $record->inventory_schedule; // YYYY-MM format
            $this->status = $record->scheduling_status;
            $this->title = "Inventory Scheduling #{$record->id}";
        } elseif ($record instanceof Transfer) {
            $this->type = 'property_transfer';
            $this->recordId = $record->id;
            $this->dueDate = $record->scheduled_date;
            $this->status = $record->status;
            $this->title = "Property Transfer #{$record->id}";
        } elseif ($record instanceof OffCampus) {
            $this->type = 'off_campus';
            $this->recordId = $record->id;
            $this->dueDate = $record->return_date;
            $this->status = $record->status;
            $this->title = "Off-Campus #{$record->id}";
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

        $label = $this->type === 'off_campus' ? 'Return Date' : 'Scheduled For';
        $formattedDate = 'Not specified';
        $daysOverdue = 0;

        if ($this->type === 'inventory_scheduling' && $this->dueDate) {
            $end = Carbon::createFromFormat('Y-m', $this->dueDate)->endOfMonth();
            $formattedDate = $end->format('F Y');
            $daysOverdue = (int) max(0, $end->diffInDays(now(), false));
        } elseif (in_array($this->type, ['property_transfer', 'off_campus']) && $this->dueDate) {
            $date = Carbon::parse($this->dueDate);
            $formattedDate = $date->format('F j, Y');
            $daysOverdue = (int) max(0, $date->diffInDays(now(), false));
        }

        $url = match ($this->type) {
            'inventory_scheduling' => route('inventory-scheduling.view', $this->recordId),
            'property_transfer'    => route('transfers.view', $this->recordId),
            'off_campus'           => route('off-campus.view', $this->recordId),
            default                => '#',
        };

        return (new MailMessage)
            ->subject("{$this->title} OVERDUE")
            ->view('emails.overdue-forms', [
                'name'          => $notifiable->name,
                'title'         => $this->title,
                'scheduled_for' => $formattedDate,
                'label'         => $label,
                'days_overdue'  => $daysOverdue,
                'status'        => $this->status,
                'url'           => $url,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $link = match ($this->type) {
            'inventory_scheduling' => route('inventory-scheduling.view', $this->recordId),
            'property_transfer'    => route('transfers.view', $this->recordId),
            'off_campus'           => route('off-campus.view', $this->recordId),
            default                => '#',
        };

        return [
            'title'   => "{$this->title} Overdue",
            'message' => $this->type === 'off_campus'
                ? "{$this->title} has not been returned by its due date."
                : "{$this->title} has been marked as overdue.",
            'status'  => $this->status,
            'link'    => $link,
        ];
    }
}
