<?php

namespace App\Observers;

use App\Models\TransferSignatory;
use App\Traits\LogsAuditTrail;

class TransferSignatoryObserver
{
    use LogsAuditTrail;

    public function created(TransferSignatory $signatory)
    {
        $this->logAction('create', $signatory, [], $signatory->toArray());
    }

    public function updated(TransferSignatory $signatory)
    {
        $this->logAction(
            'update',
            $signatory,
            $signatory->getOriginal(),
            $signatory->getChanges()
        );
    }

    public function deleted(TransferSignatory $signatory)
    {
        $this->logAction('delete', $signatory, $signatory->getOriginal(), []);
    }
}
