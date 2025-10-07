<?php

namespace App\Observers;

use App\Models\Building;
use App\Traits\LogsAuditTrail;

class BuildingObserver
{
    use LogsAuditTrail;

    public function created(Building $building)
    {
        $this->logAction('create', $building, [], $building->toArray());
    }

    public function updated(Building $building)
    {
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $building->getChanges()) && $building->deleted_at === null) {
            return;
        }

        $this->logAction(
            'update',
            $building,
            $building->getOriginal(),
            $building->getChanges()
        );
    }

    public function deleted(Building $building)
    {
        $this->logAction('delete', $building, $building->getOriginal(), []);
    }

    // ✅ Handle restore events explicitly
    public function restored(Building $building)
    {
        $this->logAction(
            'restore',
            $building,
            [],
            $building->toArray()
        );
    }
}
