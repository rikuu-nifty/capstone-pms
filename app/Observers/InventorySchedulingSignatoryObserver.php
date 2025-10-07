<?php

namespace App\Observers;

use App\Models\InventorySchedulingSignatory;
use App\Traits\LogsAuditTrail;

class InventorySchedulingSignatoryObserver
{
    use LogsAuditTrail;

    public function created(InventorySchedulingSignatory $signatory)
    {
        $this->logAction('create', $signatory, [], $signatory->toArray());
    }

    public function updated(InventorySchedulingSignatory $signatory)
    {
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $signatory->getChanges()) && $signatory->deleted_at === null) {
            return;
        }

        $this->logAction(
            'update',
            $signatory,
            $signatory->getOriginal(),
            $signatory->getChanges()
        );
    }

    public function deleted(InventorySchedulingSignatory $signatory)
    {
        $this->logAction('delete', $signatory, $signatory->getOriginal(), []);
    }

    // ✅ Handle restore events explicitly
    public function restored(InventorySchedulingSignatory $signatory)
    {
        $this->logAction(
            'restore', // 👈 simplified value for database
            $signatory,
            [],
            $signatory->toArray()
        );
    }
}
