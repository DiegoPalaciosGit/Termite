<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HojaViajera extends Model
{
    protected $table = 'hojas_viajeras';

    protected $fillable = [
        'client_id', 'product_name', 'quantity',
        'status', 'notes', 'estimated_end_date', 'actual_end_date',
    ];

    protected $casts = [
        'estimated_end_date' => 'date',
        'actual_end_date'    => 'date',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (HojaViajera $hoja) {
            $year = now()->year;
            $count = static::whereYear('created_at', $year)->count();
            $hoja->folio = 'HV-' . $year . '-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);
        });
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function stages(): HasMany
    {
        return $this->hasMany(HojaStage::class)->orderBy('created_at');
    }

    const STAGES = [
        'corte'     => 'Corte (CNC / Sierra)',
        'lijado'    => 'Lijado / Porosidad',
        'laca'      => 'Laca / Pintura',
        'ensamble'  => 'Ensamble / Herrajes',
        'emplayado' => 'Emplayado y Almacén',
    ];

    const STATUS_LABELS = [
        'en_proceso' => 'En Proceso',
        'retrabajo'  => 'Retrabajo',
        'terminado'  => 'Terminado',
    ];

    const STATUS_COLORS = [
        'en_proceso' => 'bg-blue-100 text-blue-800',
        'retrabajo'  => 'bg-red-100 text-red-800',
        'terminado'  => 'bg-green-100 text-green-800',
    ];
}
