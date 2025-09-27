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
}
