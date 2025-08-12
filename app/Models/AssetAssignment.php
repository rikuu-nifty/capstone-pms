<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetAssignment extends Model
{

    protected $casts = [
        'date_assigned' => 'date',
    ];

    public function asset()
    {
        return $this->belongsTo(InventoryList::class, 'asset_id');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function unitOrDepartment()
    {
        return $this->belongsTo(UnitOrDepartment::class, 'unit_or_department_id');
    }
}
