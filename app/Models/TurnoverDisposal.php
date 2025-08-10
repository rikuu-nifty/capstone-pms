<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TurnoverDisposal extends Model
{
    public function turnoverDisposalAssets() 
    {
        return $this->hasMany(TurnoverDisposalAsset::class, 'turnover_disposal_id');
    }

    public function issuedBy() {
        return $this->belongsTo(User::class, 'issued_by');
    }

}
