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

    // Relationship: UnitOrDepartment has many inventory schedulings
    public function inventorySchedulings()
    {
        return $this->hasMany(InventoryScheduling::class);
    }

    public function issuingOffice()
    {
        return $this->hasMany(TurnoverDisposal::class, 'issuing_office');
    }

    public function receivingOffice()
    {
        return $this->hasMany(TurnoverDisposal::class, 'receiving_office');
    }

    public function assetAssignment()
    {
        return $this->hasMany(AssetAssignment::class, 'unit_or_department_id');
    }

    // Relationship to OffCampus table (via college_or_unit_id FK)
    public function offCampuses()
    {
        return $this->hasMany(OffCampus::class, 'college_or_unit_id');
    }
}
