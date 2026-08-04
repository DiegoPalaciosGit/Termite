# Spec 02 — Inventario

**Objetivo:** Carlos puede ver el stock actual de todos sus materiales, registrar entradas y salidas, y recibir alertas cuando un material está por agotarse.  
**Sprint:** 2 (Días 6–12, Parte A)  
**Responsable de código:** Gael  
**Responsable de spec y QA:** Diego  
**Prerequisito:** Spec 01 completo.

---

## Descripción del Módulo

El inventario reemplaza el Excel y la memoria de Carlos. Cada material tiene un stock mínimo configurado; cuando el stock baja de ese mínimo, el sistema muestra una alerta en el dashboard.

### Categorización ABC (fija en MVP)

| Categoría | Criterio | Materiales en Escobar |
|-----------|----------|-----------------------|
| **A** | Alta rotación y alto costo — control riguroso | MDF 15mm Maple, MDF 6mm, MDF Enchapado Blanco |
| **B** | Rotación media | Bisagras, Patas grises, Tornillos |
| **C** | Baja rotación | Lacas, Tintas, Solventes |

---

## Reglas de Negocio

### RN-01: Método PEPS simplificado para MVP
- En MVP: llevar `cost_unit` como **costo promedio ponderado** — suficiente para el semáforo de margen.
- PEPS completo (lote por lote) se implementa en Sprint 3 si Carlos lo necesita.
- Cada movimiento de entrada actualiza el `cost_unit` promedio del material.

**Fórmula de actualización de costo promedio:**
```
nuevo_costo_promedio = (stock_actual × costo_actual + cantidad_entrada × costo_entrada) / (stock_actual + cantidad_entrada)
```

### RN-02: Stock actual
- `stock_current` = suma de todas las entradas − suma de todas las salidas del material.
- Se actualiza en cada movimiento (no se recalcula desde cero — se incrementa/decrementa).
- No puede ser negativo: validar antes de registrar una salida.

### RN-03: Alerta de stock mínimo
- Si `stock_current <= stock_min` → el material está en alerta.
- Mostrar alerta en: vista de lista de materiales (badge rojo), vista del material individual, y dashboard (contador de materiales en alerta).

### RN-04: Categoría A/B/C es configurable por material
- Carlos puede cambiar la categoría de un material (no está bloqueada).

### RN-05: Unidades
- Cada material tiene su unidad (`tablero`, `pza`, `lts`, `kg`, `caja`).
- No hay conversión de unidades en MVP — todo en la misma unidad del material.

### RN-06: Precio de materiales con `cost_unit = 0`
- Los materiales cargados en el seed tienen precios en 0 (los que no tenemos datos de Carlos).
- Carlos los actualiza manualmente en la vista de edición del material.
- Si `cost_unit = 0`, mostrar badge "Precio pendiente" en la vista.

---

## Rutas

```
GET  /materiales                        → lista ABC con stock y alertas
GET  /materiales/create                 → nuevo material
POST /materiales                        → guardar material
GET  /materiales/{id}                   → detalle + historial de movimientos
GET  /materiales/{id}/edit              → editar material
PUT  /materiales/{id}                   → guardar edición
POST /materiales/{id}/entrada           → registrar entrada de stock
POST /materiales/{id}/salida            → registrar salida de stock
GET  /materiales/{id}/movimientos       → historial paginado (mismo que show, tab separado o scroll)
```

---

## Validaciones

### Crear/Editar material

```php
[
    'code'          => 'required|string|max:50|unique:materials,code',  // en edición: unique excepto self
    'name'          => 'required|string|max:255',
    'category'      => 'required|in:A,B,C',
    'unit'          => 'required|string|max:20',
    'cost_unit'     => 'required|numeric|min:0',
    'stock_current' => 'required|numeric|min:0',
    'stock_min'     => 'required|numeric|min:0',
    'notes'         => 'nullable|string',
]
```

### Registrar entrada

```php
[
    'quantity'   => 'required|numeric|min:0.001',
    'unit_cost'  => 'required|numeric|min:0',
    'notes'      => 'nullable|string',
]
```

### Registrar salida

```php
[
    'quantity'         => 'required|numeric|min:0.001|max:{stock_actual}',  // validar en controller
    'reference_type'   => 'nullable|in:hoja_viajera,ajuste',
    'reference_id'     => 'nullable|integer',
    'notes'            => 'nullable|string',
]
```

Validación adicional en controller:
```php
if ($request->quantity > $material->stock_current) {
    return back()->withErrors(['quantity' => 'No hay suficiente stock. Stock actual: ' . $material->stock_current . ' ' . $material->unit]);
}
```

---

## Models

### `Material.php`

```php
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
        return $this->stock_current <= $this->stock_min;
    }

    public function hasPendingPrice(): bool
    {
        return $this->cost_unit == 0;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}
```

### `MaterialMovement.php`

```php
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
```

---

## Service: `InventarioService.php`

```php
<?php

namespace App\Services;

use App\Models\Material;
use App\Models\MaterialMovement;
use Illuminate\Support\Facades\DB;

class InventarioService
{
    public function registrarEntrada(Material $material, float $cantidad, float $costoUnitario, ?string $notas = null): MaterialMovement
    {
        return DB::transaction(function () use ($material, $cantidad, $costoUnitario, $notas) {
            // Actualizar costo promedio ponderado
            $stockActual = (float) $material->stock_current;
            $costoActual = (float) $material->cost_unit;

            if ($stockActual > 0 || $costoActual > 0) {
                $nuevoCosto = ($stockActual * $costoActual + $cantidad * $costoUnitario) / ($stockActual + $cantidad);
            } else {
                $nuevoCosto = $costoUnitario;
            }

            $material->stock_current += $cantidad;
            $material->cost_unit = round($nuevoCosto, 2);
            $material->save();

            return MaterialMovement::create([
                'material_id'    => $material->id,
                'type'           => 'entrada',
                'quantity'       => $cantidad,
                'unit_cost'      => $costoUnitario,
                'reference_type' => 'manual',
                'notes'          => $notas,
                'user_id'        => auth()->id(),
            ]);
        });
    }

    public function registrarSalida(Material $material, float $cantidad, ?string $referenceType = null, ?int $referenceId = null, ?string $notas = null): MaterialMovement
    {
        if ($cantidad > $material->stock_current) {
            throw new \Exception("Stock insuficiente. Disponible: {$material->stock_current} {$material->unit}");
        }

        return DB::transaction(function () use ($material, $cantidad, $referenceType, $referenceId, $notas) {
            $material->stock_current -= $cantidad;
            $material->save();

            return MaterialMovement::create([
                'material_id'    => $material->id,
                'type'           => 'salida',
                'quantity'       => $cantidad,
                'unit_cost'      => $material->cost_unit,
                'reference_type' => $referenceType ?? 'manual',
                'reference_id'   => $referenceId,
                'notes'          => $notas,
                'user_id'        => auth()->id(),
            ]);
        });
    }
}
```

---

## Controller: `MaterialController.php` — estructura base

```php
public function index()
{
    $materiales = Material::active()->orderBy('category')->orderBy('name')->get();
    $alertas = $materiales->filter(fn($m) => $m->isLowStock())->count();
    return view('materiales.index', compact('materiales', 'alertas'));
}

public function entradaStore(Request $request, Material $material, InventarioService $inventario)
{
    $data = $request->validate([
        'quantity'  => 'required|numeric|min:0.001',
        'unit_cost' => 'required|numeric|min:0',
        'notes'     => 'nullable|string',
    ]);

    $inventario->registrarEntrada($material, $data['quantity'], $data['unit_cost'], $data['notes'] ?? null);

    return back()->with('success', "Entrada registrada. Nuevo stock: {$material->fresh()->stock_current} {$material->unit}");
}

public function salidaStore(Request $request, Material $material, InventarioService $inventario)
{
    $request->validate([
        'quantity'       => 'required|numeric|min:0.001',
        'reference_type' => 'nullable|in:hoja_viajera,ajuste',
        'reference_id'   => 'nullable|integer',
        'notes'          => 'nullable|string',
    ]);

    if ($request->quantity > $material->stock_current) {
        return back()->withErrors(['quantity' => "Stock insuficiente. Disponible: {$material->stock_current} {$material->unit}"]);
    }

    $inventario->registrarSalida($material, $request->quantity, $request->reference_type, $request->reference_id, $request->notes);

    return back()->with('success', "Salida registrada. Nuevo stock: {$material->fresh()->stock_current} {$material->unit}");
}
```

---

## Vistas — Descripción

### `materiales/index.blade.php`
- Encabezado con contador: "X materiales en alerta de stock" (si > 0, en rojo)
- Tabla agrupada por categoría (A, B, C)
- Columnas: Código | Nombre | Stock actual | Unidad | Stock mín | Precio/u | Estado
- Estado: badge "En alerta" (rojo) o "OK" (verde) o "Precio pendiente" (amarillo)
- Botón "Registrar entrada" y "Registrar salida" por fila (o en el detalle)
- Botón "Nuevo material" arriba

### `materiales/show.blade.php`
- Info del material: código, nombre, categoría, unidad
- Stock actual grande + badge de alerta si aplica
- Formularios de entrada y salida (colapsables o tabs)
- Historial de movimientos: tabla con fecha, tipo (entrada/salida), cantidad, costo/u, notas, referencia

---

## Criterios de Aceptación del Sprint 2 — Parte A

1. Seed carga los 11 materiales con sus categorías correctas.
2. La lista muestra materiales agrupados A → B → C.
3. Carlos registra una entrada de 10 tableros de MDF 15mm a $792/u → stock pasa de 0 a 10.
4. Carlos registra una salida de 8 tableros → stock pasa a 2 → badge "En alerta" aparece (stock_min=5).
5. El dashboard muestra "1 material en alerta" (o similar).
6. Si Carlos intenta sacar 5 tableros con stock de 2, recibe error y el stock no cambia.
7. Historial muestra las 2 transacciones en orden descendente.

---

## Lo que NO hace este módulo

- No escanea QR (Sprint 3).
- No lee facturas XML del SAT (Sprint 4).
- No calcula Punto de Pedido UDG ni Stock de Seguridad (requiere 2-3 meses de histórico).
- No vincula automáticamente una salida a una Hoja Viajera (mejora Sprint 3).

---

*Spec version: 1.0 — 2026-06-14*
