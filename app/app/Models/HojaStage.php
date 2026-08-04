<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HojaStage extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'hoja_viajera_id', 'stage', 'worker_name',
        'started_at', 'finished_at', 'duration_minutes', 'notes',
    ];

    protected $casts = [
        'started_at'  => 'datetime',
        'finished_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::saving(function (HojaStage $stage) {
            if ($stage->started_at && $stage->finished_at) {
                $stage->duration_minutes = (int) $stage->started_at->diffInMinutes($stage->finished_at);
            }
            $stage->created_at = $stage->created_at ?? now();
        });
    }

    public function hojaViajera(): BelongsTo
    {
        return $this->belongsTo(HojaViajera::class);
    }

    public function getDurationFormattedAttribute(): string
    {
        if (!$this->duration_minutes) return '—';
        $h = intdiv($this->duration_minutes, 60);
        $m = $this->duration_minutes % 60;
        return $h > 0 ? "{$h}h {$m}m" : "{$m}m";
    }
}
