<?php

namespace App\Models;

// use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

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
        'image_path',
    ];

    protected $appends = ['image_url'];

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

    public function getImageUrlAttribute(): ?string
    {
        $p = $this->image_path;
        if (!$p) return null;

        // Already a full URL or absolute path
        if (Str::startsWith($p, ['http://', 'https://', '/'])) return $p;

        // Saved under /public/images/...
        if (Str::startsWith($p, 'images/')) return asset($p);

        // Default: stored on 'public' disk => /storage/...
        return asset('storage/' . $p);
    }
}
