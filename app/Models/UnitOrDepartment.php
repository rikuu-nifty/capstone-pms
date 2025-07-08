<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnitOrDepartment extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        // 'unit_head', // Uncomment this if you decide to include this field in your table later
    ];

    // A Unit or Department can have many inventory items
    public function inventoryLists()
    {
        return $this->hasMany(InventoryList::class);
    }
}
