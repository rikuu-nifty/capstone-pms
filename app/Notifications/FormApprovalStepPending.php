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
        return ['mail', 'database'];
    }

    /**
     * Clean queued email channel (no direct send, no ResendMailer)
     */
    public function toMail(object $notifiable): MailMessage
    {
        $approvalUrl = url('/approvals');

        $html = View::make('emails.form-approval-pending', [
            'approverName' => $notifiable->name,
            'formTitle'    => $this->formTitle,
            'stepLabel'    => $this->step->label,
            'approvalUrl'  => $approvalUrl,
        ])->render();

        return (new MailMessage)
            ->subject("Approval Needed: {$this->formTitle}")
            ->html($html);
    }

    /**
     * Same as before: in-app database notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title'   => 'Form Approval Pending',
            'message' => "Approval is required for: {$this->formTitle}.",
            'step'    => $this->step->label,
            'link'    => url('/approvals'),
        ];
    }
}
