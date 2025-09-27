<?php

namespace App\Observers;

use App\Models\FormApproval;
use App\Traits\LogsAuditTrail;

class FormApprovalObserver
{
    use LogsAuditTrail;

    public function created(FormApproval $form)
    {
        $this->logAction('create', $form, [], $form->toArray());
    }

    public function updated(FormApproval $form)
    {
        $this->logAction(
            'update',
            $form,
            $form->getOriginal(),
            $form->getChanges()
        );
    }

    public function deleted(FormApproval $form)
    {
        $this->logAction('delete', $form, $form->getOriginal(), []);
    }
}
