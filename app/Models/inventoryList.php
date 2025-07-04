<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class inventoryList extends Model
{
        protected $fillable = [
        'id',
        'memorandum_no',
        'asset_model_id',
        'asset_name',
        'description',
        'org_id',
        'building',
        'building_room',
        'serial_no',
        'supplier',
        'unit_cost',
        'brand',
        'date_purchased',
        'asset_type',
        'quantity',
        'unit_or_department',
        'status',
        'transfer_status',

    ];

}
