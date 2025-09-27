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
}
