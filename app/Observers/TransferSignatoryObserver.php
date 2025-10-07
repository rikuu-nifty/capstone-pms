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

    public function deleted(TransferSignatory $signatory)
    {
        $this->logAction('delete', $signatory, $signatory->getOriginal(), []);
    }

    // ✅ Handle restore events explicitly
    public function restored(TransferSignatory $signatory)
    {
        $this->logAction(
            'restore',
            $signatory,
            [],
            $signatory->toArray()
        );
    }
}
