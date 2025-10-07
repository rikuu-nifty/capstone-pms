<?php

namespace App\Observers;

use App\Models\FormApprovalSteps;
use App\Traits\LogsAuditTrail;

class FormApprovalStepsObserver
{
    use LogsAuditTrail;

    public function created(FormApprovalSteps $step)
    {
        $this->logAction('create', $step, [], $step->toArray());
    }

    public function updated(FormApprovalSteps $step)
    {
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $step->getChanges()) && $step->deleted_at === null) {
            return;
        }

        $this->logAction(
            'update',
            $step,
            $step->getOriginal(),
            $step->getChanges()
        );
    }

    public function deleted(FormApprovalSteps $step)
    {
        $this->logAction('delete', $step, $step->getOriginal(), []);
    }

    // ✅ Handle restore events explicitly
    public function restored(FormApprovalSteps $step)
    {
        $this->logAction(
            'restore',
            $step,
            [],
            $step->toArray()
        );
    }
}
