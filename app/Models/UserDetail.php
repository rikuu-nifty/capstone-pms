<?php

namespace App\Models;

// use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;

class UserDetail extends Model
{
    // use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'first_name',
        'middle_name',
        'last_name',
        'gender',
        'contact_no',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getFullNameAttribute(): string
    {
        $first = $this->first_name;
        $middle = $this->middle_name;
        $last = $this->last_name;

        if ($middle) {
            $initial = strtoupper(substr($middle, 0, 1));
            return "{$first} {$initial}. {$last}";
        }

        return "{$first} {$last}";
    }
}
