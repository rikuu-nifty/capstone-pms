<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TurnoverDisposalAsset extends Model
{
    protected $fillable = [
        'turnover_disposal_id', 
        'asset_id'
    ];

    public $timestamps = true;

    public function turnoverDisposal()
    {
        return $this->belongsTo(TurnoverDisposal::class, 'turnover_disposal_id');
    }

    public function assets()
    {
        return $this->belongsTo(InventoryList::class, 'asset_id');
    }
}
