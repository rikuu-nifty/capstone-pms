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
}
