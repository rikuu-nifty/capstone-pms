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
}
