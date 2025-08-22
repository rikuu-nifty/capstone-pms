<?php
namespace App\Policies;

use App\Models\User;
use App\Models\FormApproval;

class FormApprovalPolicy
{
    public function review(User $user, FormApproval $approval): bool
    {
        // return in_array($user->role, ['PMO Head', 'VP Admin']);
        return true;
    }

    // public function viewInbox(User $user): bool
    // {
    //     return in_array($user->role, ['PMO Head']);
    // }

    public function viewInbox(User $user): bool 
    { 
        return true; 
    }
}
