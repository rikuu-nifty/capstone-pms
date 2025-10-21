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

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) { // Automatically set today's date if none is provided
            if (empty($model->date_assigned)) {
                $model->date_assigned = now()->toDateString();
            }
        });
    }

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
