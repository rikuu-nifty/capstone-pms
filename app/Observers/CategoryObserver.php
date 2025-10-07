<?php

namespace App\Observers;

use App\Models\Category;
use App\Traits\LogsAuditTrail;

class CategoryObserver
{
    use LogsAuditTrail;

    public function created(Category $category)
    {
        $this->logAction('create', $category, [], $category->toArray());
    }

    public function updated(Category $category)
    {
        // ✅ Skip updates triggered by restore (deleted_at → null)
        if (array_key_exists('deleted_at', $category->getChanges()) && $category->deleted_at === null) {
            return;
        }

        $this->logAction(
            'update',
            $category,
            $category->getOriginal(),
            $category->getChanges()
        );
    }

    public function deleted(Category $category)
    {
        $this->logAction('delete', $category, $category->getOriginal(), []);
    }

    // ✅ Handle restore events explicitly
    public function restored(Category $category)
    {
        $this->logAction(
            'restore',
            $category,
            [],
            $category->toArray()
        );
    }
}
