<?php

namespace App\Observers;

use App\Models\AssetAssignment;
use App\Traits\LogsAuditTrail;

class AssetAssignmentObserver
{
    use LogsAuditTrail;

    public function created(AssetAssignment $assignment)
    {
        $this->logAction('create', $assignment, [], $assignment->toArray());
    }

    public function updated(AssetAssignment $assignment)
    {
        $this->logAction(
            'update',
            $assignment,
            $assignment->getOriginal(),
            $assignment->getChanges()
        );
    }

    public function deleted(AssetAssignment $assignment)
    {
        $this->logAction('delete', $assignment, $assignment->getOriginal(), []);
    }
}
