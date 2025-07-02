<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class inventoryList extends Model
{
        protected $fillable = [
        'asset_name',
        'brand',  
        'date_purchased',  
        'asset_type',  
        'quantity',  
        'building',  
        'unit_or_department',  
        'status',  
        'room',  
        'memorandum_no',  
        'description',  
        'supplier',  
        'unit_cost',  
        'serial_numbers',  
        'model',  
        'transfer_status',  
    ];

}
