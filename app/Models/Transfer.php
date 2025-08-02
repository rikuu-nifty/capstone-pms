<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{
    public function currentBuildingRoom()
    {
        return $this->belongsTo(BuildingRoom::class, 'current_building_room');
    }

    public function currentOrganization()
    {
        return $this->belongsTo(UnitOrDepartment::class, 'current_organization');
    }

    public function receivingBuildingRoom()
    {
        return $this->belongsTo(BuildingRoom::class, 'receiving_building_room');
    }

    public function receivingOrganization()
    {
        return $this->belongsTo(UnitOrDepartment::class, 'receiving_organization');
    }

    public function designatedEmployee()
    {
        return $this->belongsTo(User::class, 'designated_employee');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
