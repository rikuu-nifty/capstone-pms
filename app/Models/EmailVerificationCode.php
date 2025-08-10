<?php

// app/Models/EmailVerificationCode.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailVerificationCode extends Model
{
    protected $table = 'email_verification_codes';

    protected $fillable = [
        'user_id',
        'code_hash',
        'expires_at',
        'max_attempts',
        'attempts',
        'consumed_at',
        'sent_to_email',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'expires_at'  => 'datetime',
        'consumed_at' => 'datetime',
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

