<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TurnoverDisposalAsset extends Model
{
    public function turnoverDisposal()
    {
        return $this->belongsTo(TurnoverDisposal::class, 'turnover_disposal_id');
    }

    public function assets()
    {
        return $this->belongsTo(InventoryList::class, 'asset_id');
    }
}
