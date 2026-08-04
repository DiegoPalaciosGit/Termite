# Spec 01 — Hojas Viajeras

**Objetivo:** Carlos puede crear órdenes de producción, ver su estado en tiempo real y registrar el tiempo de cada fase.  
**Sprint:** 1 (Días 1–5)  
**Responsable de código:** Gael  
**Responsable de spec y QA:** Diego  
**Prerequisito:** Spec 00 completo (Laravel + DB funcionando).

---

## Descripción del Módulo

Una **Hoja Viajera** es el equivalente digital del papel físico que Carlos pone en cada mueble al entrar al taller. Contiene toda la información del pedido y se actualiza conforme el mueble pasa por cada etapa de producción.

### Flujo de vida de una Hoja Viajera

```
Carlos crea HV → Corte → Lijado → Laca → Ensamble → Emplayado → Entregado
                                     ↑
                                  (si hay error) → Retrabajo
```

---

## Reglas de Negocio

### RN-01: Folio automático e inmutable
- Formato: `HV-{AÑO}-{NNN}` (ej. `HV-2026-001`)
- Se genera automáticamente al crear la HV. Carlos no lo elige.
- Una vez creado, el folio **nunca cambia**, aunque se edite la HV.
- `NNN` es un contador secuencial por año que empieza en 001.

### RN-02: Status
Solo 3 estados posibles:

| Status | Descripción |
|--------|-------------|
| `en_proceso` | Mueble avanzando normalmente |
| `retrabajo` | Pieza dañada, requiere rehacer una etapa |
| `terminado` | Listo para entrega |

- Status inicial: siempre `en_proceso`.
- Solo Carlos puede cambiar el status.
- Un mueble en `terminado` no puede volver a `en_proceso` (es final).

### RN-03: Etapas (hardcodeadas en MVP)
Las 5 etapas son fijas — no son configurables en el MVP:

| Clave | Nombre visible |
|-------|----------------|
| `corte` | Corte (CNC / Sierra) |
| `lijado` | Lijado / Porosidad |
| `laca` | Laca / Pintura |
| `ensamble` | Ensamble / Herrajes |
| `emplayado` | Emplayado y Almacén |

### RN-04: Registro de tiempos
- Carlos registra manualmente cuándo empezó y terminó cada etapa.
- Si se registran `started_at` Y `finished_at`, el sistema calcula `duration_minutes` automáticamente.
- Una etapa puede registrarse sin `started_at` (solo `finished_at`) — válido para etapas ya completadas.
- No hay restricción de orden: Carlos puede registrar "Laca" sin haber registrado "Corte".
- Una HV puede tener **múltiples registros de la misma etapa** (si hubo retrabajo).

### RN-05: Cliente opcional en MVP
- El campo `client_id` es opcional. Carlos puede crear una HV sin cliente asignado.
- Si no hay cliente, mostrar "Sin cliente" en las vistas.

### RN-06: Cantidad
- La `quantity` es cuántas piezas iguales cubre esta Hoja Viajera.
- Mínimo: 1. No hay máximo en MVP.
- Ejemplo: "Mueble Pink Up × 50" es una sola HV con quantity=50.

---

## Rutas

```
GET    /hojas                    → lista de todas las HVs (paginada)
GET    /hojas/create             → formulario nueva HV
POST   /hojas                    → guardar nueva HV
GET    /hojas/{id}               → detalle de una HV + bitácora de etapas
GET    /hojas/{id}/edit          → formulario de edición (solo product_name, quantity, notes, client_id, estimated_end_date)
PUT    /hojas/{id}               → guardar edición
PATCH  /hojas/{id}/status        → cambiar status
POST   /hojas/{id}/stages        → registrar inicio/fin de una etapa
DELETE /hojas/{id}/stages/{sid}  → eliminar un registro de etapa (corrección de error)
```

---

## Validaciones de Formulario

### Crear/Editar HV

```php
[
    'product_name'        => 'required|string|max:255',
    'quantity'            => 'required|integer|min:1',
    'client_id'           => 'nullable|exists:clients,id',
    'notes'               => 'nullable|string',
    'estimated_end_date'  => 'nullable|date|after_or_equal:today',
]
```

### Registrar etapa

```php
[
    'stage'        => 'required|in:corte,lijado,laca,ensamble,emplayado',
    'worker_name'  => 'nullable|string|max:100',
    'started_at'   => 'nullable|date',
    'finished_at'  => 'nullable|date|after_or_equal:started_at',
    'notes'        => 'nullable|string',
]
```

### Cambiar status

```php
[
    'status' => 'required|in:en_proceso,retrabajo,terminado',
]
```

Regla adicional (en controller):
```php
if ($hoja->status === 'terminado') {
    return back()->withErrors(['status' => 'Una HV terminada no puede cambiar de status.']);
}
```

---

## Models

### `HojaViajera.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HojaViajera extends Model
{
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
}
```

### `HojaStage.php`

```php
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
```

---

## Controllers

### `HojaViajeraController.php` — estructura base

```php
<?php

namespace App\Http\Controllers;

use App\Models\HojaViajera;
use App\Models\HojaStage;
use App\Models\Client;
use Illuminate\Http\Request;

class HojaViajeraController extends Controller
{
    public function index()
    {
        $hojas = HojaViajera::with('client')
            ->orderByRaw("CASE status WHEN 'retrabajo' THEN 0 WHEN 'en_proceso' THEN 1 ELSE 2 END")
            ->orderByDesc('created_at')
            ->paginate(20);

        return view('hojas.index', compact('hojas'));
    }

    public function create()
    {
        $clientes = Client::orderBy('name')->get();
        return view('hojas.create', compact('clientes'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_name'       => 'required|string|max:255',
            'quantity'           => 'required|integer|min:1',
            'client_id'          => 'nullable|exists:clients,id',
            'notes'              => 'nullable|string',
            'estimated_end_date' => 'nullable|date|after_or_equal:today',
        ]);

        $hoja = HojaViajera::create($data);

        return redirect()->route('hojas.show', $hoja)
            ->with('success', "Hoja Viajera {$hoja->folio} creada.");
    }

    public function show(HojaViajera $hoja)
    {
        $hoja->load(['client', 'stages']);
        $stages = HojaViajera::STAGES;
        return view('hojas.show', compact('hoja', 'stages'));
    }

    public function edit(HojaViajera $hoja)
    {
        $clientes = Client::orderBy('name')->get();
        return view('hojas.edit', compact('hoja', 'clientes'));
    }

    public function update(Request $request, HojaViajera $hoja)
    {
        $data = $request->validate([
            'product_name'       => 'required|string|max:255',
            'quantity'           => 'required|integer|min:1',
            'client_id'          => 'nullable|exists:clients,id',
            'notes'              => 'nullable|string',
            'estimated_end_date' => 'nullable|date',
        ]);

        $hoja->update($data);

        return redirect()->route('hojas.show', $hoja)
            ->with('success', 'Hoja Viajera actualizada.');
    }

    public function updateStatus(Request $request, HojaViajera $hoja)
    {
        $request->validate(['status' => 'required|in:en_proceso,retrabajo,terminado']);

        if ($hoja->status === 'terminado') {
            return back()->withErrors(['status' => 'Una HV terminada no puede cambiar de status.']);
        }

        $hoja->status = $request->status;
        if ($request->status === 'terminado') {
            $hoja->actual_end_date = now();
        }
        $hoja->save();

        return back()->with('success', 'Status actualizado.');
    }
}
```

### `HojaStageController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\HojaViajera;
use App\Models\HojaStage;
use Illuminate\Http\Request;

class HojaStageController extends Controller
{
    public function store(Request $request, HojaViajera $hoja)
    {
        $data = $request->validate([
            'stage'       => 'required|in:corte,lijado,laca,ensamble,emplayado',
            'worker_name' => 'nullable|string|max:100',
            'started_at'  => 'nullable|date',
            'finished_at' => 'nullable|date|after_or_equal:started_at',
            'notes'       => 'nullable|string',
        ]);

        $hoja->stages()->create($data);

        return back()->with('success', 'Etapa registrada.');
    }

    public function destroy(HojaViajera $hoja, HojaStage $stage)
    {
        abort_unless($stage->hoja_viajera_id === $hoja->id, 403);
        $stage->delete();
        return back()->with('success', 'Registro eliminado.');
    }
}
```

---

## Rutas (`routes/web.php`)

```php
use App\Http\Controllers\HojaViajeraController;
use App\Http\Controllers\HojaStageController;

Route::middleware('auth')->group(function () {
    Route::resource('hojas', HojaViajeraController::class);
    Route::patch('hojas/{hoja}/status', [HojaViajeraController::class, 'updateStatus'])->name('hojas.status');
    Route::post('hojas/{hoja}/stages', [HojaStageController::class, 'store'])->name('hojas.stages.store');
    Route::delete('hojas/{hoja}/stages/{stage}', [HojaStageController::class, 'destroy'])->name('hojas.stages.destroy');
});
```

---

## Vistas — Descripción (Gael implementa con Blade)

### `hojas/index.blade.php`
- Tabla con columnas: Folio | Producto | Cliente | Cantidad | Status | Fecha estimada | Acciones
- Filas ordenadas: retrabajo primero (rojo), luego en_proceso, luego terminado
- Badge de color por status: rojo=retrabajo, azul=en_proceso, verde=terminado
- Botón "Nueva HV" visible arriba
- Paginación

### `hojas/create.blade.php`
- Campos: Producto (text), Cliente (select con opción "Sin cliente"), Cantidad (number), Fecha estimada (date), Notas (textarea)
- Botón "Crear Hoja Viajera"

### `hojas/show.blade.php`
- Header: Folio grande, Producto, Cliente, Cantidad, Status con badge, Fecha estimada/real
- Botones de cambio de status (solo si no es `terminado`)
- Tabla de bitácora de etapas:
  - Columnas: Etapa | Trabajador | Inicio | Fin | Duración | Notas | Eliminar
- Formulario para agregar nueva etapa (select de etapa, input trabajador, datetime inicio, datetime fin, notas)
- Enlace "Editar HV"

### `hojas/edit.blade.php`
- Igual que create pero pre-poblado. El folio NO es editable (solo visible).

---

## Criterios de Aceptación del Sprint 1

1. Carlos puede crear `HV-2026-001` para "Mueble Pink Up", cliente "Inés", cantidad 1.
2. El folio se genera solo — Carlos no lo escribe.
3. En el detalle de la HV, Carlos registra que "Miguel Márquez" hizo el Corte: inicio 8:00, fin 8:45 → duración calculada: 45 min.
4. Carlos cambia status a "retrabajo" → la fila aparece en rojo en la lista.
5. Carlos cambia status a "terminado" → `actual_end_date` se guarda con la fecha de hoy.
6. Si intenta cambiar status de una HV `terminado`, recibe error.
7. La lista muestra HVs con paginación, ordenadas: retrabajo primero.
8. Carlos puede eliminar un registro de etapa incorrecto.

---

## Lo que NO hace este módulo

- No calcula costos de mano de obra por HV (eso es Sprint 2 / Sprint 3).
- No genera QR de la HV (Sprint 3).
- No vincula materiales consumidos a una HV (Sprint 2).
- No notifica al trabajador (Fase 2).
- No tiene portal de cliente (Fase 2).

---

*Spec version: 1.0 — 2026-06-14*
