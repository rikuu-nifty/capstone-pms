<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RoleChanged
{
    use Dispatchable, SerializesModels;

    public $user;     // the affected user
    public $oldRole;  // previous role name
    public $newRole;  // new role name

    public function __construct(User $user, $oldRole, $newRole)
    {
        $this->user = $user;
        $this->oldRole = $oldRole;
        $this->newRole = $newRole;
    }
}
