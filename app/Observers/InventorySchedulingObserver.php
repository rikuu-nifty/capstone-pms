<?php

namespace App\Observers;

use App\Models\InventoryScheduling;
use App\Traits\LogsAuditTrail;

class InventorySchedulingObserver
{
    use LogsAuditTrail;

    public function created(InventoryScheduling $schedule)
    {
        $this->logAction('create', $schedule, [], $schedule->toArray());
    }

    public function updated(InventoryScheduling $schedule)
    {
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $schedule->getChanges()) && $schedule->deleted_at === null) {
            return;
        }

        $this->logAction(
            'update',
            $schedule,
            $schedule->getOriginal(),
            $schedule->getChanges()
        );
    }

    public function deleted(InventoryScheduling $schedule)
    {
        $this->logAction('delete', $schedule, $schedule->getOriginal(), []);
    }

    // ✅ Handle restore events explicitly
    public function restored(InventoryScheduling $schedule)
    {
        $this->logAction(
            'restore',
            $schedule,
            [],
            $schedule->toArray()
        );
    }
}
