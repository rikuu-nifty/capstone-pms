<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OffCampusAsset extends Model
{
        protected $fillable = [
        'off_campus_id',
        'asset_id',
        'status'
     ];

public function asset()
    {
        return $this->belongsTo(InventoryList::class, "asset_id");
    }

public function offCampus()
    {
        return $this->belongsTo(OffCampus::class, "off_campus_id'");
    }
}
