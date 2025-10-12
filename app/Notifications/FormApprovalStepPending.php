<?php

namespace App\Notifications;

use App\Models\FormApprovalSteps;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\View;

class FormApprovalStepPending extends Notification implements ShouldQueue
{
    use Queueable;

    protected $step;
    protected $formTitle;

    public function __construct(FormApprovalSteps $step, string $formTitle)
    {
        $this->step = $step;
        $this->formTitle = $formTitle;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $approvalUrl = url('/approvals'); // adjust if needed

        // Render Blade template
        $html = View::make('emails.form-approval-pending', [
            'approverName' => $notifiable->name,
            'formTitle'    => $this->formTitle,
            'stepLabel'    => $this->step->label,
            'approvalUrl'  => $approvalUrl,
        ])->render();

        // Build MailMessage using rendered HTML
        return (new MailMessage)
            ->subject("Approval Needed: {$this->formTitle}")
            ->view('emails.form-approval-pending', [
                'approverName' => $notifiable->name,
                'formTitle'    => $this->formTitle,
                'stepLabel'    => $this->step->label,
                'approvalUrl'  => $approvalUrl,
            ]);
    }
}
