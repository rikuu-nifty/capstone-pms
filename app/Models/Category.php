<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    // A Category has many Asset Models
    public function assetModels()
    {
        return $this->hasMany(AssetModel::class);
    }
}
