<?php

namespace App\Listeners;

use App\Events\RoleChanged;
use App\Models\AuditTrail;

#[\Illuminate\Foundation\Attributes\AsListener(event: RoleChanged::class)]
class LogRoleChanged
{
    public function handle(RoleChanged $event): void
    {
        $actor = auth()->user(); // who made the change
        $affected = $event->user; // the user whose role was changed

        AuditTrail::create([
            'auditable_type' => get_class($affected),
            'auditable_id'   => $affected->id,

            'actor_id'       => $actor?->id,
            'actor_name'     => $actor?->name,
            'unit_or_department_id' => $actor?->unit_or_department_id,

            'action'         => 'role_changed',
            'subject_type'   => 'user',

            // Include both old/new role and the affected user’s email in the values
            'old_values'     => [
                'role' => $event->oldRole,
                'user_email' => $affected->email,
            ],
            'new_values'     => [
                'role' => $event->newRole,
                'user_email' => $affected->email,
            ],

            'ip_address'     => request()->ip(),
            'user_agent'     => request()->header('User-Agent'),
            'route'          => request()->path(),
        ]);
    }
}
