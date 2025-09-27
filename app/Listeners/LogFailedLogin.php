<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Failed;
use App\Models\AuditTrail;

#[\Illuminate\Foundation\Attributes\AsListener(event: Failed::class)]
class LogFailedLogin
{
    public function handle(Failed $event): void
    {
        AuditTrail::create([
            'auditable_type' => null,
            'auditable_id'   => null,
            'actor_id'       => null,
            'actor_name'     => $event->credentials['email'] ?? 'unknown',
            'unit_or_department_id' => null,
            'action'         => 'login_failed',
            'subject_type'   => 'user',
            'ip_address'     => request()->ip(),
            'user_agent'     => request()->header('User-Agent'),
            'route'          => request()->path(),
        ]);
    }
}
