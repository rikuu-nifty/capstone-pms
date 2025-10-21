<?php

namespace App\Observers;

use App\Models\TurnoverDisposal;
use App\Traits\LogsAuditTrail;
use App\Models\VerificationForm;

class TurnoverDisposalObserver
{
    use LogsAuditTrail;

    public function created(TurnoverDisposal $disposal)
    {
        VerificationForm::firstOrCreate(
            ['turnover_disposal_id' => $disposal->id],
            ['status' => 'pending']
        );
        
        $this->logAction('create', $disposal, [], $disposal->toArray());
    }

    public function updated(TurnoverDisposal $disposal)
    {
        // Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $disposal->getChanges()) && $disposal->deleted_at === null) {
            return;
        }

        $this->logAction(
            'update',
            $disposal,
            $disposal->getOriginal(),
            $disposal->getChanges()
        );
    }

    public function deleted(TurnoverDisposal $disposal)
    {
        // Soft delete related VerificationForm (if any)
        $disposal->verificationForm()?->delete();

        $this->logAction('delete', $disposal, $disposal->getOriginal(), []);
    }

    // Handle restore events explicitly
    public function restored(TurnoverDisposal $disposal)
    {
        // Recreate verification form if missing
        if (!$disposal->verificationForm) {VerificationForm::create([
                'turnover_disposal_id' => $disposal->id,
                'status' => 'pending',
            ]);
        }

        $this->logAction('restore', $disposal, [], $disposal->toArray());
    }
}
