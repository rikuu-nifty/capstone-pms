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
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $item->getChanges()) && $item->deleted_at === null) {
            return;
        }

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

    // ✅ Handle restore events explicitly
    public function restored(AssetAssignmentItem $item)
    {
        $this->logAction(
            'restore',
            $item,
            [],
            $item->toArray()
        );
    }
}
