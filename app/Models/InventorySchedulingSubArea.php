<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventorySchedulingSubArea extends Model
{
    protected $fillable = [
        'inventory_scheduling_id',
        'sub_area_id',
    ];

    public function scheduling()
    {
        return $this->belongsTo(InventoryScheduling::class, 'inventory_scheduling_id');
    }

    public function subArea()
    {
        return $this->belongsTo(SubArea::class, 'sub_area_id');
    }
}
