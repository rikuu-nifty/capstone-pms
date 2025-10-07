<?php

namespace App\Observers;

use App\Models\AssetModel;
use App\Traits\LogsAuditTrail;

class AssetModelObserver
{
    use LogsAuditTrail;

    public function created(AssetModel $model)
    {
        $this->logAction('create', $model, [], $model->toArray());
    }

    public function updated(AssetModel $model)
    {
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $model->getChanges()) && $model->deleted_at === null) {
            return;
        }

        $this->logAction(
            'update',
            $model,
            $model->getOriginal(),
            $model->getChanges()
        );
    }

    public function deleted(AssetModel $model)
    {
        $this->logAction('delete', $model, $model->getOriginal(), []);
    }

    // ✅ Handle restore events explicitly
    public function restored(AssetModel $model)
    {
        $this->logAction(
            'restore',
            $model,
            [],
            $model->toArray()
        );
    }
}
