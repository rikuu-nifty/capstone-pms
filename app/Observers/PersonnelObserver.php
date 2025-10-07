<?php

namespace App\Observers;

use App\Models\Personnel;
use App\Traits\LogsAuditTrail;

class PersonnelObserver
{
    use LogsAuditTrail;

    public function created(Personnel $personnel)
    {
        $this->logAction('create', $personnel, [], $personnel->toArray());
    }

    public function updated(Personnel $personnel)
    {
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $personnel->getChanges()) && $personnel->deleted_at === null) {
            return;
        }

        $this->logAction(
            'update',
            $personnel,
            $personnel->getOriginal(),
            $personnel->getChanges()
        );
    }

    public function deleted(Personnel $personnel)
    {
        $this->logAction('delete', $personnel, $personnel->getOriginal(), []);
    }

    // ✅ Handle restore events explicitly
    public function restored(Personnel $personnel)
    {
        $this->logAction(
            'restore',
            $personnel,
            [],
            $personnel->toArray()
        );
    }
}
