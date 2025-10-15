<?php

namespace App\Notifications;

use App\Models\FormApprovalSteps;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Log;
use App\Services\ResendMailer;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

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

    // public function via(object $notifiable): array
    // {
    //     // Send immediately when triggered
    //     $this->sendEmailNow($notifiable);

    //     return ['database'];
    // }
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $approvalUrl = url('/approvals');

        // Render the Blade email view into a full HTML string
        $html = View::make('emails.form-approval-pending', [
            'approverName' => $notifiable->name,
            'formTitle'    => $this->formTitle,
            'stepLabel'    => $this->step->label,
            'approvalUrl'  => $approvalUrl,
        ])->render();

        // Send HTML using Laravel's built-in mail channel
        return (new MailMessage)
            ->subject("Approval Needed: {$this->formTitle}")
            ->html($html);
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

            ResendMailer::sendHtml(
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
