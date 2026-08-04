<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShopConfig extends Model
{
    protected $table = 'shop_config';
    public $timestamps = false;

    protected $fillable = [
        'rate_carpintero', 'rate_laqueador', 'rate_cnc',
        'rate_auxiliar_carp', 'rate_auxiliar_laq', 'rate_administrativo',
        'monthly_rent', 'monthly_electricity', 'monthly_machinery_depreciation',
        'min_margin_pct',
    ];

    protected $casts = [
        'rate_carpintero'                => 'decimal:2',
        'rate_laqueador'                 => 'decimal:2',
        'rate_cnc'                       => 'decimal:2',
        'rate_auxiliar_carp'             => 'decimal:2',
        'rate_auxiliar_laq'              => 'decimal:2',
        'rate_administrativo'            => 'decimal:2',
        'monthly_rent'                   => 'decimal:2',
        'monthly_electricity'            => 'decimal:2',
        'monthly_machinery_depreciation' => 'decimal:2',
        'min_margin_pct'                 => 'decimal:2',
    ];

    public static function current(): self
    {
        return static::firstOrFail();
    }

    public function getCostoIndirectoDiarioAttribute(): float
    {
        return ((float)$this->monthly_rent + (float)$this->monthly_electricity + (float)$this->monthly_machinery_depreciation) / 22;
    }
}
