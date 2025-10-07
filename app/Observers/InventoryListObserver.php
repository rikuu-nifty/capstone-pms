<?php

namespace App\Observers;

use App\Models\InventoryList;
use App\Traits\LogsAuditTrail;

class InventoryListObserver
{
    use LogsAuditTrail;

    public function created(InventoryList $inventory)
    {
        $this->logAction('create', $inventory, [], $inventory->toArray());
    }

    public function updated(InventoryList $inventory)
    {
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $inventory->getChanges()) && $inventory->deleted_at === null) {
            return;
        }

        $this->logAction(
            'update',
            $inventory,
            $inventory->getOriginal(),
            $inventory->getChanges()
        );
    }

    public function deleted(InventoryList $inventory)
    {
        $this->logAction('delete', $inventory, $inventory->getOriginal(), []);
    }

    // ✅ Handle restore events explicitly
    public function restored(InventoryList $inventory)
    {
        $this->logAction(
            'restore',
            $inventory,
            [],
            $inventory->toArray()
        );
    }
}
