<?php
namespace App\Models;

use App\Enums\ApprovalStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormApproval extends Model
{
    protected $fillable = [
        'requested_by_id','reviewed_by_id',
        'form_type','form_title',
        'status','review_notes',
        'requested_at','reviewed_at',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'reviewed_at'  => 'datetime',
    ];

    public function approvable(): MorphTo   
    { 
        return $this->morphTo(); 
    }

    public function requestedBy(): BelongsTo
    { 
        return $this->belongsTo(User::class, 'requested_by_id'); 
    }

    public function reviewedBy(): BelongsTo 
    { 
        return $this->belongsTo(User::class, 'reviewed_by_id'); 
    }

    public function scopePending($q)  
    { 
        return $q->where('status', 
        ApprovalStatus::PENDING_REVIEW->value); 
    }
    
    public function scopeApproved($q) 
    { 
        return $q->where('status', ApprovalStatus::APPROVED->value); 
    }

    public function scopeRejected($q) 
    { 
        return $q->where('status', ApprovalStatus::REJECTED->value); 
    }

    public function scopeQuickSearch($q, ?string $s) {
        if (!$s) return $q;
        
        $s = trim($s);
        return $q->where(function($qq) use ($s) {
            $qq->where('form_title', 'like', "%{$s}%")
               ->orWhereDate('requested_at', $s)
               ->orWhereHas('requestedBy', fn($rq) => $rq->where('name','like',"%{$s}%"));
        });
    }
}
