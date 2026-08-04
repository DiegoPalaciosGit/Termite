<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Material extends Model
{
    protected $fillable = [
        'code', 'name', 'category', 'unit',
        'cost_unit', 'stock_current', 'stock_min', 'notes', 'is_active',
    ];

    protected $casts = [
        'cost_unit'     => 'decimal:2',
        'stock_current' => 'decimal:3',
        'stock_min'     => 'decimal:3',
        'is_active'     => 'boolean',
    ];

    public function movements(): HasMany
    {
        return $this->hasMany(MaterialMovement::class)->orderByDesc('created_at');
    }

    public function isLowStock(): bool
    {
        return (float) $this->stock_current <= (float) $this->stock_min;
    }

    public function hasPendingPrice(): bool
    {
        return (float) $this->cost_unit == 0;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
