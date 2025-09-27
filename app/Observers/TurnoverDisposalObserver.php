<?php

namespace App\Observers;

use App\Models\TurnoverDisposal;
use App\Traits\LogsAuditTrail;

class TurnoverDisposalObserver
{
    use LogsAuditTrail;

    public function created(TurnoverDisposal $disposal)
    {
        $this->logAction('create', $disposal, [], $disposal->toArray());
    }

    public function updated(TurnoverDisposal $disposal)
    {
        $this->logAction(
            'update',
            $disposal,
            $disposal->getOriginal(),
            $disposal->getChanges()
        );
    }

    public function deleted(TurnoverDisposal $disposal)
    {
        $this->logAction('delete', $disposal, $disposal->getOriginal(), []);
    }
}
