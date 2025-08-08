<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransferAsset extends Model
{
    protected $fillable = [
        'transfer_id',
        'asset_id',
    ];

    public function transfer()
    {
        return $this->belongsTo(Transfer::class, "transfer_id");
    }

    public function asset()
    {
        return $this->belongsTo(InventoryList::class, "asset_id");
    }
}
