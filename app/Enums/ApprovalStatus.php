<?php

namespace App\Enums;

enum ApprovalStatus: string {
    case PENDING_REVIEW = 'pending_review';
    case APPROVED       = 'approved';
    case REJECTED       = 'rejected';
    case CANCELLED      = 'cancelled';
}
