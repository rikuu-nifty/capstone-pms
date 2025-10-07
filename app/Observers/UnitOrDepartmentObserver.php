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
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $unit->getChanges()) && $unit->deleted_at === null) {
            return;
        }

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

    // ✅ Handle restore events explicitly
    public function restored(UnitOrDepartment $unit)
    {
        $this->logAction(
            'restore',
            $unit,
            [],
            $unit->toArray()
        );
    }
}
