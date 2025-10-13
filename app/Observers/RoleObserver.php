<?php

namespace App\Observers;

use App\Models\Role;
use App\Traits\LogsAuditTrail;

class RoleObserver
{
    use LogsAuditTrail;

    public function created(Role $role)
    {
        $this->logAction('create', $role, [], $role->toArray());
    }

    public function updated(Role $role)
    {
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $role->getChanges()) && $role->deleted_at === null) {
            return;
        }

        $this->logAction(
            'update',
            $role,
            $role->getOriginal(),
            $role->getChanges()
        );
    }

    public function deleted(Role $role)
    {
        $this->logAction('delete', $role, $role->getOriginal(), []);
    }

    // ✅ Handle restore events explicitly
    public function restored(Role $role)
    {
        $this->logAction(
            'restore',
            $role,
            [],
            $role->toArray()
        );
    }
}
