<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventorySchedulingAsset extends Model
{
    protected $fillable = [
        'inventory_scheduling_id',
        'inventory_list_id',
        'inventory_status',
        'remarks',
        'inventoried_at',
    ];

    public function scheduling()
    {
        return $this->belongsTo(InventoryScheduling::class, 'inventory_scheduling_id');
    }

    public function asset()
    {
        return $this->belongsTo(InventoryList::class, 'inventory_list_id');
    }
}
