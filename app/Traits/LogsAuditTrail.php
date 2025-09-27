<?php

namespace App\Traits;

use App\Models\AuditTrail;

trait LogsAuditTrail
{
    protected function logAction($action, $model, $oldValues = [], $newValues = [])
    {
        $user = auth()->user();

        AuditTrail::create([
            'auditable_type'        => get_class($model),
            'auditable_id'          => $model->id,
            'actor_id'              => $user?->id,
            'actor_name'            => $user?->name,
            'unit_or_department_id' => $user?->unit_or_department_id,
            'action'                => $action,
            'subject_type'          => class_basename($model),
            'old_values'            => $oldValues,
            'new_values'            => $newValues,
            'ip_address'            => request()->ip(),
            'user_agent'            => request()->header('User-Agent'),
            'route'                 => request()->path(),
        ]);
    }

    /**
     * Shortcut for logging "view" actions
     */
    protected function logViewing($model)
    {
        $this->logAction('view', $model, [], []);
    }
}
