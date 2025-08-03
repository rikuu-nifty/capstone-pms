<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransferAsset extends Model
{
    public function transfer()
    {
        return $this->belongsTo(Transfer::class, "transfer_id");
    }

    public function inventoryList()
    {
        return $this->belongsTo(InventoryList::class, "asset_id");
    }
}
