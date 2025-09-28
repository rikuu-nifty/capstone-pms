<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class OffCampusAsset extends Model
{

    use SoftDeletes;

    protected $fillable = [
        'off_campus_id',
        'asset_id',
        'asset_model_id',
        'quantity',
        'units',
        'comments',
    ];

    public function offCampus()   
    { 
         return $this->belongsTo(OffCampus::class, 'off_campus_id')->withTrashed();
    }
    
    // Optional convenience scopes
    public function scopeActive($query)       { return $query->whereNull('deleted_at'); }
    public function scopeOnlyArchived($query) { return $query->onlyTrashed(); }
    public function scopeWithArchived($query) { return $query->withTrashed(); }

    public function asset()       
    { 
        return $this->belongsTo(InventoryList::class, 'asset_id'); 
    }
    
    public function assetModel()  
    { 
        return $this->belongsTo(AssetModel::class, 'asset_model_id'); 
    }

    // public function assets()
    // {
    //     // ✅ class reference resolves because of the use-statement above
    //     return $this->hasMany(OffCampusAsset::class, 'off_campus_id');
    // }
}
