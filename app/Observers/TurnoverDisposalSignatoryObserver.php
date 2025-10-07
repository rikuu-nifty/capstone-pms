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

    public function deleted(TurnoverDisposalSignatory $signatory)
    {
        $this->logAction('delete', $signatory, $signatory->getOriginal(), []);
    }

    // ✅ Handle restore events explicitly
    public function restored(TurnoverDisposalSignatory $signatory)
    {
        $this->logAction(
            'restore',
            $signatory,
            [],
            $signatory->toArray()
        );
    }
}
