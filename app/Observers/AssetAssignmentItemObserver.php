<?php

namespace App\Observers;

use App\Models\AssetAssignmentItem;
use App\Traits\LogsAuditTrail;

class AssetAssignmentItemObserver
{
    use LogsAuditTrail;

    public function created(AssetAssignmentItem $item)
    {
        $this->logAction('create', $item, [], $item->toArray());
    }

    public function updated(AssetAssignmentItem $item)
    {
        $this->logAction(
            'update',
            $item,
            $item->getOriginal(),
            $item->getChanges()
        );
    }

    public function deleted(AssetAssignmentItem $item)
    {
        $this->logAction('delete', $item, $item->getOriginal(), []);
    }
}
