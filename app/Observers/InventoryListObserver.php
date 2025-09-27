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
}
