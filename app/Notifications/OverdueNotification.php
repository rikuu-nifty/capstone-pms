<?php

namespace App\Notifications;

use App\Models\InventoryScheduling;                            // ← target scheduling
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;

use Illuminate\Support\Facades\Log;

class OverdueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected InventoryScheduling $schedule;

    // Accept an InventoryScheduling instance
    public function __construct(InventoryScheduling $schedule)
    {
        $this->schedule = $schedule;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        Log::info("✉️ Sending OverdueNotification for schedule #{$this->schedule->id} to {$notifiable->email}");

        // inventory_schedule is 'YYYY-MM'
        $ym  = (string) $this->schedule->inventory_schedule;
        $end = $ym ? Carbon::createFromFormat('Y-m', $ym)->endOfMonth() : null;

        $scheduledFor = $end
            ? $end->timezone(config('app.timezone'))->format('F Y')
            : 'Not specified';

        $daysOverdue = $end ? max(0, $end->diffInDays(now(), false)) : 0;

        return (new MailMessage)
            ->subject("Inventory Scheduling OVERDUE: #{$this->schedule->id}")
            ->view('emails.inventory-scheduling-overdue', [
                'name'          => $notifiable->name,
                'schedule_id'   => $this->schedule->id,
                'scheduled_for' => $scheduledFor,
                'days_overdue'  => $daysOverdue,
                'status'        => $this->schedule->scheduling_status,
                'url'           => url('/inventory-scheduling/' . $this->schedule->id),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title'         => 'Inventory Scheduling Overdue',
            'message'       => "Inventory Scheduling #{$this->schedule->id} is OVERDUE.",
            'scheduled_for' => $this->schedule->inventory_schedule, // 'YYYY-MM'
            'status'        => $this->schedule->scheduling_status,
            'link'          => route('inventory-scheduling.show', $this->schedule->id),
        ];
    }
}
