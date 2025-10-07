<?php

namespace App\Observers;

use App\Models\Transfer;
use App\Traits\LogsAuditTrail;

class PropertyTransferObserver
{
    use LogsAuditTrail;

    public function created(Transfer $transfer)
    {
        $this->logAction('create', $transfer, [], $transfer->toArray());
    }

    public function updated(Transfer $transfer)
    {
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $transfer->getChanges()) && $transfer->deleted_at === null) {
            return;
        }

        $this->logAction(
            'update',
            $transfer,
            $transfer->getOriginal(),
            $transfer->getChanges()
        );
    }

    public function deleted(Transfer $transfer)
    {
        $this->logAction('delete', $transfer, $transfer->getOriginal(), []);
    }

    // ✅ Handle restore events explicitly
    public function restored(Transfer $transfer)
    {
        $this->logAction(
            'restore',
            $transfer,
            [],
            $transfer->toArray()
        );
    }
}
