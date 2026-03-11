<?php

namespace App\Observers;

use App\Models\VerificationForm;
use App\Traits\LogsAuditTrail;

class VerificationFormObserver
{
    use LogsAuditTrail;

    /**
     * Handle the VerificationForm "created" event.
     */
    public function created(VerificationForm $verificationForm)
    {
        $this->logAction('create', $verificationForm, [], $verificationForm->toArray());
    }

    /**
     * Handle the VerificationForm "updated" event.
     */
    public function updated(VerificationForm $verificationForm)
    {
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $verificationForm->getChanges()) && $verificationForm->deleted_at === null) {
            return;
        }

        $this->logAction(
            'update',
            $verificationForm,
            $verificationForm->getOriginal(),
            $verificationForm->getChanges()
        );
    }

    /**
     * Handle the VerificationForm "deleted" event.
     */
    public function deleted(VerificationForm $verificationForm)
    {
        $this->logAction('delete', $verificationForm, $verificationForm->getOriginal(), []);
    }

    /**
     * Handle the VerificationForm "restored" event.
     */
    public function restored(VerificationForm $verificationForm)
    {
        $this->logAction(
            'restore',
            $verificationForm,
            [],
            $verificationForm->toArray()
        );
    }
}