<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialMovement extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'material_id', 'type', 'quantity', 'unit_cost',
        'reference_type', 'reference_id', 'notes', 'user_id',
    ];

    protected $casts = [
        'quantity'   => 'decimal:3',
        'unit_cost'  => 'decimal:2',
        'created_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn($m) => $m->created_at = $m->created_at ?? now());
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }
}
