<?php

namespace App\Observers;

use App\Models\OffCampusSignatory;
use App\Traits\LogsAuditTrail;
use Illuminate\Support\Str;

class OffCampusSignatoryObserver
{
    use LogsAuditTrail;

    public function created(OffCampusSignatory $signatory)
    {
        $this->logAction('create', $signatory, [], $signatory->toArray());
    }

    public function updated(OffCampusSignatory $signatory)
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

    public function deleted(OffCampusSignatory $signatory)
    {
        $this->logAction('delete', $signatory, $signatory->getOriginal(), []);
    }

    // ✅ Handle restore events explicitly
    public function restored(OffCampusSignatory $signatory)
    {
        $this->logAction(
            'restore', // 👈 simplified value for database
            $signatory,
            [],
            $signatory->toArray()
        );
    }

}
