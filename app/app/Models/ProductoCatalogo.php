<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductoCatalogo extends Model
{
    protected $table = 'products_catalog';

    protected $fillable = [
        'name', 'sale_price', 'estimated_cost', 'margin_pct', 'margin_status', 'notes', 'is_active',
    ];

    protected $casts = [
        'sale_price'     => 'decimal:2',
        'estimated_cost' => 'decimal:2',
        'margin_pct'     => 'decimal:2',
        'is_active'      => 'boolean',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::saving(function (ProductoCatalogo $p) {
            $p->recalcularSemaforo();
        });
    }

    public function recalcularSemaforo(): void
    {
        if (!(float)$this->sale_price || !(float)$this->estimated_cost) {
            $this->margin_pct = 0;
            $this->margin_status = 'gris';
            return;
        }

        $this->margin_pct = (((float)$this->sale_price - (float)$this->estimated_cost) / (float)$this->sale_price) * 100;

        $config = ShopConfig::current();
        $min = (float) $config->min_margin_pct;

        $this->margin_status = match(true) {
            $this->margin_pct >= $min        => 'verde',
            $this->margin_pct >= ($min - 10) => 'amarillo',
            default                          => 'rojo',
        };
    }

    public function getSemaforoBadgeAttribute(): string
    {
        return match($this->margin_status) {
            'verde'    => 'bg-green-100 text-green-800',
            'amarillo' => 'bg-yellow-100 text-yellow-800',
            'rojo'     => 'bg-red-100 text-red-800',
            default    => 'bg-gray-100 text-gray-500',
        };
    }

    public function getSemaforoLabelAttribute(): string
    {
        return match($this->margin_status) {
            'verde'    => '🟢 ' . number_format($this->margin_pct, 1) . '%',
            'amarillo' => '🟡 ' . number_format($this->margin_pct, 1) . '%',
            'rojo'     => '🔴 ' . number_format($this->margin_pct, 1) . '%',
            default    => 'Sin datos',
        };
    }
}
