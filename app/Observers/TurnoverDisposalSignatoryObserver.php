<?php

namespace App\Observers;

use App\Models\TurnoverDisposalSignatory;
use App\Traits\LogsAuditTrail;

class TurnoverDisposalSignatoryObserver
{
    use LogsAuditTrail;

    public function created(TurnoverDisposalSignatory $signatory)
    {
        $this->logAction('create', $signatory, [], $signatory->toArray());
    }

    public function updated(TurnoverDisposalSignatory $signatory)
    {
        $this->logAction(
            'update',
            $signatory,
            $signatory->getOriginal(),
            $signatory->getChanges()
        );
    }

    public function deleted(TurnoverDisposalSignatory $signatory)
    {
        $this->logAction('delete', $signatory, $signatory->getOriginal(), []);
    }
}
