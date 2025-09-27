<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Logout;
use App\Models\AuditTrail;

#[\Illuminate\Foundation\Attributes\AsListener(event: Logout::class)]
class LogUserLogout
{
    public function handle(Logout $event): void
    {
        $user = $event->user;

        AuditTrail::create([
            'auditable_type' => null,
            'auditable_id'   => null,
            'actor_id'       => $user->id,
            'actor_name'     => $user->name,
            'unit_or_department_id' => $user->unit_or_department_id,
            'action'         => 'logout',
            'subject_type'   => 'user',
            'ip_address'     => request()->ip(),
            'user_agent'     => request()->header('User-Agent'),
            'route'          => request()->path(),
        ]);
    }
}
