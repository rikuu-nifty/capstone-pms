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
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $offCampus->getChanges()) && $offCampus->deleted_at === null) {
            return;
        }

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

    // ✅ Handle restore events explicitly
    public function restored(OffCampus $offCampus)
    {
        $this->logAction(
            'restore',
            $offCampus,
            [],
            $offCampus->toArray()
        );
    }
}
