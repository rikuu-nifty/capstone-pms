<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TurnoverDisposal extends Model
{
    protected $fillable = [
        'issuing_office_id',
        'type',
        'receiving_office_id',
        'description',
        'personnel_in_charge',
        'document_date',
        'status',
        'remarks',
    ];

    protected $casts = [
        'document_date' => 'date',
    ];

    public function turnoverDisposalAssets() 
    {
        return $this->hasMany(TurnoverDisposalAsset::class, 'turnover_disposal_id');
    }

    public function issuingOffice() 
    {
        return $this->belongsTo(UnitOrDepartment::class, 'issuing_office_id');
    }

    public function receivingOffice() 
    {
        return $this->belongsTo(UnitOrDepartment::class, 'receiving_office_id');
    }
}
