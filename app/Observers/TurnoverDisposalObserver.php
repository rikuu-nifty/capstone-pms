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
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $disposal->getChanges()) && $disposal->deleted_at === null) {
            return;
        }

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

    // ✅ Handle restore events explicitly
    public function restored(TurnoverDisposal $disposal)
    {
        $this->logAction(
            'restore',
            $disposal,
            [],
            $disposal->toArray()
        );
    }
}
