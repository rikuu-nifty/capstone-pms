<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerificationFormAsset extends Model
{
    protected $fillable = [
        'verification_form_id', 
        'inventory_list_id', 
        'remarks'
    ];

    public function verificationForm(): BelongsTo
    {
        return $this->belongsTo(VerificationForm::class);
    }

    public function inventoryList(): BelongsTo
    {
        return $this->belongsTo(InventoryList::class);
    }
}
