<?php

namespace App\Events;

use App\Models\FormApprovalSteps;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FormApproved
{
    use Dispatchable, SerializesModels;

    public $step;
    public $status;

    public function __construct(FormApprovalSteps $step, string $status)
    {
        $this->step = $step;
        $this->status = $status; // approved / rejected
    }
}
