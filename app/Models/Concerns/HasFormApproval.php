<?php
// app/Models/Concerns/HasFormApproval.php
namespace App\Models\Concerns;

use App\Models\FormApproval;
use App\Enums\ApprovalStatus;
use Illuminate\Database\Eloquent\Relations\MorphOne;

trait HasFormApproval
{
    public function formApproval(): MorphOne
    {
        return $this->morphOne(FormApproval::class, 'approvable');
    }

    // Helper to (re)open an approval after create/update if desired
    public function openApproval(int $requestedById, ?string $title = null, ?string $type = null): FormApproval
    {
        return $this->formApproval()->create([
            'requested_by_id' => $requestedById,
            'form_type'       => $type   ?? $this->approvalFormType(),
            'form_title'      => $title  ?? $this->approvalFormTitle(),
            'status'          => ApprovalStatus::PENDING_REVIEW->value,
            'requested_at'    => now(),
        ]);
    }

    // Sensible defaults; override in each model if you want a nicer title
    public function approvalFormTitle(): string
    {
        return class_basename($this) . ' #' . $this->getKey();
    }

    public function approvalFormType(): string
    {
        return str(class_basename($this))->snake()->toString(); // e.g., "transfer"
    }
}
