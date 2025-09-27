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
}
