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
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $form->getChanges()) && $form->deleted_at === null) {
            return;
        }

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

    // ✅ Handle restore events explicitly
    public function restored(FormApproval $form)
    {
        $this->logAction(
            'restore',
            $form,
            [],
            $form->toArray()
        );
    }
}
