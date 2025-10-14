<?php

namespace App\Notifications;

use App\Models\FormApprovalSteps;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Log;
use App\Services\ResendMailer;

class FormApprovalStepPending extends Notification
{
    use Queueable;

    protected $step;
    protected $formTitle;

    public function __construct(FormApprovalSteps $step, string $formTitle)
    {
        $this->step = $step;
        $this->formTitle = $formTitle;
    }

    /**
     * Channels — stores in DB and sends email instantly through Resend.
     */
    public function via(object $notifiable): array
    {
        // Send immediately when triggered
        $this->sendEmailNow($notifiable);

        return ['database'];
    }

    /**
     * For in-app (database) notification center.
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

    /**
     * Send the email directly through ResendMailer.
     */
    protected function sendEmailNow(object $notifiable): void
    {
        try {
            $approvalUrl = url('/approvals');

            $html = View::make('emails.form-approval-pending', [
                'approverName' => $notifiable->name,
                'formTitle'    => $this->formTitle,
                'stepLabel'    => $this->step->label,
                'approvalUrl'  => $approvalUrl,
            ])->render();

            ResendMailer::send(
                $notifiable->email,
                "Approval Needed: {$this->formTitle}",
                $html
            );

            Log::info("✅ FormApprovalStepPending email sent via Resend", [
                'email' => $notifiable->email,
                'form'  => $this->formTitle,
                'step'  => $this->step->label,
            ]);
        } catch (\Throwable $e) {
            Log::error("❌ Failed to send FormApprovalStepPending email", [
                'email' => $notifiable->email ?? 'unknown',
                'error' => $e->getMessage(),
            ]);
        }
    }
}
