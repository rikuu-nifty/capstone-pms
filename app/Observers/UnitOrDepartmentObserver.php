<?php

namespace App\Observers;

use App\Models\UnitOrDepartment;
use App\Traits\LogsAuditTrail;

class UnitOrDepartmentObserver
{
    use LogsAuditTrail;

    public function created(UnitOrDepartment $unit)
    {
        $this->logAction('create', $unit, [], $unit->toArray());
    }

    public function updated(UnitOrDepartment $unit)
    {
        $this->logAction(
            'update',
            $unit,
            $unit->getOriginal(),
            $unit->getChanges()
        );
    }

    public function deleted(UnitOrDepartment $unit)
    {
        $this->logAction('delete', $unit, $unit->getOriginal(), []);
    }
}
