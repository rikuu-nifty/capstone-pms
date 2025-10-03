<?php

namespace App\Observers;

use App\Models\OffCampusSignatory;
use App\Traits\LogsAuditTrail;

class OffCampusSignatoryObserver
{
    use LogsAuditTrail;

    public function created(OffCampusSignatory $signatory)
    {
        $this->logAction('create', $signatory, [], $signatory->toArray());
    }

    public function updated(OffCampusSignatory $signatory)
    {
        $this->logAction(
            'update',
            $signatory,
            $signatory->getOriginal(),
            $signatory->getChanges()
        );
    }

    public function deleted(OffCampusSignatory $signatory)
    {
        $this->logAction('delete', $signatory, $signatory->getOriginal(), []);
    }
}
