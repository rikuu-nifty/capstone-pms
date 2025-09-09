<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransferAsset extends Model
{
    protected $fillable = [
        'transfer_id',
        'asset_id',
        'moved_at',
        'from_sub_area_id',
        'to_sub_area_id',
        'asset_transfer_status',
        'remarks',
    ];

    protected $casts = [
        'moved_at' => 'date:Y-m-d',
    ];

    public function transfer()
    {
        return $this->belongsTo(Transfer::class, "transfer_id");
    }

    public function asset()
    {
        return $this->belongsTo(InventoryList::class, "asset_id");
    }

    public function fromSubArea()
    {
        return $this->belongsTo(SubArea::class, 'from_sub_area_id');
    }

    public function toSubArea()
    {
        return $this->belongsTo(SubArea::class, 'to_sub_area_id');
    }
}
