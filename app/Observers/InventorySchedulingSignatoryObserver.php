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
}
