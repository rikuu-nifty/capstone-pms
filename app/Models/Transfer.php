<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{

    protected $fillable = [
        'current_building_room',
        'current_organization',
        'receiving_building_room',
        'receiving_organization',
        'designated_employee',
        'scheduled_date',
        'actual_transfer_date',
        'received_by',
        'status',
        'remarks',
    ];
    
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

    public function transferAssets()
    {
        return $this->hasMany(TransferAsset::class, 'transfer_id');
        // return $this->hasMany(TransferAsset::class, 'transfer_id')->with('inventoryList);
        /* this will allow us to show each asset detail */
    }
}
