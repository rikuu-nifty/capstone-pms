<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AssetAssignmentItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'asset_assignment_id',
        'asset_id',
        'date_assigned',
    ];

    protected $casts = [
        'date_assigned' => 'date:Y-m-d',
        'deleted_at'    => 'datetime',
    ];

    public function assignment()
    {
        return $this->belongsTo(AssetAssignment::class, 'asset_assignment_id');
    }

    public function asset()
    {
        return $this->belongsTo(InventoryList::class, 'asset_id')
            ->with(
                'assetModel.category', 
                'unitOrDepartment'
            );
    }
}
