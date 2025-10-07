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
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $assignment->getChanges()) && $assignment->deleted_at === null) {
            return;
        }

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

    // ✅ Handle restore events explicitly
    public function restored(AssetAssignment $assignment)
    {
        $this->logAction(
            'restore',
            $assignment,
            [],
            $assignment->toArray()
        );
    }
}
