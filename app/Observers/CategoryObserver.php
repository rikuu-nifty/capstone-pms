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
}
