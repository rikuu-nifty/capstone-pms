<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use App\Models\AuditTrail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

#[\Illuminate\Foundation\Attributes\AsListener(event: Login::class)]
class LogSuccessfulLogin
{
    public function handle(Login $event): void
    {
        $user = $event->user;

        AuditTrail::create([
            'auditable_type' => null,
            'auditable_id'   => null,
            'actor_id'       => $user->id,
            'actor_name'     => $user->name,
            'unit_or_department_id' => $user->unit_or_department_id,
            'action'         => 'login_success',
            'subject_type'   => 'user',
            'ip_address'     => request()->ip(),
            'user_agent'     => request()->header('User-Agent'),
            'route'          => request()->path(),
        ]);
    }
}
