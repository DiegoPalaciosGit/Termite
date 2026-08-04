<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $fillable = ['name', 'phone', 'email', 'notes'];

    public function hojasViajeras(): HasMany
    {
        return $this->hasMany(HojaViajera::class);
    }
}
