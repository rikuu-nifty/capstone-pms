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
}
