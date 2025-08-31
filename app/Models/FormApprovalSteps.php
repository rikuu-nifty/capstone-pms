<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormApprovalSteps extends Model
{
    protected $fillable = [
        'form_approval_id',
        'step_order',
        'code',
        'label',
        'is_external',
        'auto_approve_by_creator',
        'actor_user_id',
        'external_name',
        'external_title',
        'status',
        'notes',
        'acted_at',
    ];

    protected $casts = [
        'is_external' => 'boolean',
        'auto_approve_by_creator' => 'boolean',
        'acted_at' => 'datetime',
    ];

    public function approval(): BelongsTo
    {
        return $this->belongsTo(FormApproval::class, 'form_approval_id');
    }

    public function scopePending($q)  
    { 
        return $q->where('status','pending');
    }

    public function scopeApproved($q) 
    { 
        return $q->where('status','approved'); 
    }

    public function scopeRejected($q) 
    { 
        return $q->where('status','rejected'); 
    }

    public function requiresExternalInput(): bool
    {
        return $this->is_external === true;
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
