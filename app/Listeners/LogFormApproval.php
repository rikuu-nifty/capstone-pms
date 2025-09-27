<?php

namespace App\Listeners;

use App\Events\FormApproved;
use App\Models\AuditTrail;

#[\Illuminate\Foundation\Attributes\AsListener(event: FormApproved::class)]
class LogFormApproval
{
    public function handle(FormApproved $event): void
    {
        $user = auth()->user();

        AuditTrail::create([
            'auditable_type' => get_class($event->step),
            'auditable_id'   => $event->step->id,
            'actor_id'       => $user?->id,
            'actor_name'     => $user?->name,
            'unit_or_department_id' => $user?->unit_or_department_id,
            'action'         => 'form_' . strtolower($event->status), // form_approved / form_rejected
            'subject_type'   => 'FormApprovalStep',
            'old_values'     => ['status' => $event->step->getOriginal('status')],
            'new_values'     => ['status' => $event->status],
            'ip_address'     => request()->ip(),
            'user_agent'     => request()->header('User-Agent'),
            'route'          => request()->path(),
        ]);
    }
}
