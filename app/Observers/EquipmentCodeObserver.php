<?php

namespace App\Observers;

use App\Models\EquipmentCode;
use App\Traits\LogsAuditTrail;

class EquipmentCodeObserver
{
    use LogsAuditTrail;

    public function created(EquipmentCode $code)
    {
        $this->logAction('create', $code, [], $code->toArray());
    }

    public function updated(EquipmentCode $code)
    {
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $code->getChanges()) && $code->deleted_at === null) {
            return;
        }

        $this->logAction(
            'update',
            $code,
            $code->getOriginal(),
            $code->getChanges()
        );
    }

    public function deleted(EquipmentCode $code)
    {
        $this->logAction('delete', $code, $code->getOriginal(), []);
    }

    // ✅ Handle restore events explicitly
    public function restored(EquipmentCode $code)
    {
        $this->logAction(
            'restore',
            $code,
            [],
            $code->toArray()
        );
    }
}
