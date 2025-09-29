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
}
