<?php

namespace App\Models;

use App\Models\Concerns\HasFormApproval;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
// use App\Models\OffCampusAsset;
use Illuminate\Support\Facades\Auth;


class OffCampus extends Model
{

    use SoftDeletes;
    use HasFormApproval;

    protected $fillable = [

        'requester_name',
        'college_or_unit_id',
        'purpose',
        'date_issued',
        'return_date',
        'quantity',
        'units',
        // 'asset_id',
        // 'asset_model_id',
        'comments',
        'remarks',
        'approved_by',
        'issued_by_id',
        'checked_by',
        'deleted_by',
    ];
       protected $casts = [
        'date_issued' => 'date',
        'return_date' => 'date',
         'deleted_at' => 'datetime',
    ];

        // Scopes for convenience (optional)
    public function scopeActive($query)       { return $query->whereNull('deleted_at'); }
    public function scopeOnlyArchived($query) { return $query->onlyTrashed(); }
    public function scopeWithArchived($query) { return $query->withTrashed(); }

     protected static function booted()
    {
        // Archive children with parent
        static::deleting(function (OffCampus $offCampus) {
            if (! $offCampus->isForceDeleting()) {
                $offCampus->assets()->get()->each->delete();
            }
        });

        // Restore children with parent
        static::restoring(function (OffCampus $offCampus) {
            $offCampus->assets()->withTrashed()->get()->each->restore();
        });

        
    }



    // public function asset() // inventory_lists
    // {
    //     return $this->belongsTo(InventoryList::class, 'asset_id');
    // }

    // public function assets() // To select mutiple assets
    // {
    //     return $this->hasMany(OffCampusAsset::class);
    // }



 public function assets()
    {
        return $this->hasMany(OffCampusAsset::class, 'off_campus_id');
    }

    public function assetModel() // asset_models
    {
        return $this->belongsTo(AssetModel::class, 'asset_model_id');
    }

    public function collegeOrUnit() // unit_or_departments
    {
        return $this->belongsTo(UnitOrDepartment::class, 'college_or_unit_id');
    }

    public function issuedBy() // users
    {
        return $this->belongsTo(User::class, 'issued_by_id');
    }

    public function approvalFormTitle(): string
    {
        return 'Off Campus -  #' . $this->id;
    }

    protected static function bootedForm(): void
    {
        static::created(function (OffCampus $oc) {
            $oc->created_by_id ??= Auth::id();
        });

        static::created(function (OffCampus $oc) {
            if ($oc->created_by_id) {
                $oc->openApproval($oc->created_by_id);
            }
        });
    }

}