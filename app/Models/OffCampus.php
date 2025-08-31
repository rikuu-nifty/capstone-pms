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
        'status',
    ];

    protected $casts = [
        'date_issued' => 'date',
        'return_date' => 'date',
        'deleted_at' => 'datetime',
    ];

    protected array $approvalStepToColumn = [
        'external_approved_by' => 'approved_by',
        // you can add more later, e.g. 'issued_by' => 'issued_by_name'
    ];

    public function applyApprovalStepSideEffects(FormApprovalSteps $step, FormApproval $approval): void
    {
        if ($step->code === 'external_approved_by' && $step->status === 'approved') {
            // Choose your policy: overwrite always, or only if blank:
            // $shouldWrite = blank($this->approved_by);   // write only if blank
            $shouldWrite = true;                           // overwrite always

            if ($shouldWrite) {
                $this->forceFill([
                    'approved_by' => $step->external_name,
                ])->save();
            }
        }
    }

    // Scopes for convenience (optional)
    public function scopeActive($query)       
    { 
        return $query->whereNull('deleted_at'); 
    }

    public function scopeOnlyArchived($query) 
    { 
        return $query->onlyTrashed(); 
    }

    public function scopeWithArchived($query) 
    { 
        return $query->withTrashed(); 
    }

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

    public function scopeWithViewRelations($q)
    {
        return $q->with([
            'assets.asset:id,asset_model_id,asset_name,description,serial_no',
            'assets.asset.assetModel:id,brand,model',
            'collegeOrUnit:id,name,code',
            'issuedBy:id,name',
        ]);
    }

    public static function findForView(int $id): self
    {
        return static::query()->withViewRelations()->findOrFail($id);
    }

}