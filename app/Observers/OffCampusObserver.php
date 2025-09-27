<?php

namespace App\Observers;

use App\Models\OffCampus;
use App\Traits\LogsAuditTrail;

class OffCampusObserver
{
    use LogsAuditTrail;

    public function created(OffCampus $offCampus)
    {
        $this->logAction('create', $offCampus, [], $offCampus->toArray());
    }

    public function updated(OffCampus $offCampus)
    {
        $this->logAction(
            'update',
            $offCampus,
            $offCampus->getOriginal(),
            $offCampus->getChanges()
        );
    }

    public function deleted(OffCampus $offCampus)
    {
        $this->logAction('delete', $offCampus, $offCampus->getOriginal(), []);
    }
}
