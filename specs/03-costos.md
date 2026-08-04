# Spec 03 — Configuración de Costos y Semáforo de Margen

**Objetivo:** Carlos puede configurar las tarifas de su taller y ver si sus productos estrella son rentables.  
**Sprint:** 2 (Días 6–12, Partes B y C)  
**Responsable de código:** Gael  
**Responsable de spec y QA:** Diego  
**Prerequisito:** Spec 01 completo. Spec 02 ayuda pero no es bloqueante.

---

## Descripción del Módulo

Dos sub-módulos en uno:

1. **Configuración del Taller (`shop_config`)** — Carlos define sus tarifas de mano de obra y costos fijos mensuales. Es un formulario de una sola pantalla que actualiza la única fila de la tabla singleton.

2. **Semáforo de Margen (`products_catalog`)** — Carlos ve si sus 3 productos estrella son rentables. El sistema compara el precio de venta que Carlos pone contra el costo real estimado y muestra rojo/amarillo/verde.

---

## Sub-módulo A: Configuración del Taller

### Reglas de Negocio

**RN-01:** Solo existe 1 fila en `shop_config`. No se puede crear ni eliminar. Solo editar.

**RN-02:** Las tarifas vienen precargadas con los datos reales de Escobar (via seeder). Carlos puede ajustarlas.

**RN-03:** El costo fijo diario de indirectos se calcula automáticamente:
```
costo_indirecto_diario = (renta_mensual + luz_mensual + depreciacion_mensual) / 22
```
(22 días hábiles por mes — valor fijo en MVP)

**RN-04:** Este `costo_indirecto_diario` se usa en Sprint 3 para prorratear el costo de cada Hoja Viajera según sus días de producción.

### Rutas

```
GET  /config/taller    → formulario de configuración
POST /config/taller    → guardar cambios
```

### Validaciones

```php
[
    'rate_carpintero'                 => 'required|numeric|min:0',
    'rate_laqueador'                  => 'required|numeric|min:0',
    'rate_cnc'                        => 'required|numeric|min:0',
    'rate_auxiliar_carp'              => 'required|numeric|min:0',
    'rate_auxiliar_laq'               => 'required|numeric|min:0',
    'rate_administrativo'             => 'required|numeric|min:0',
    'monthly_rent'                    => 'required|numeric|min:0',
    'monthly_electricity'             => 'required|numeric|min:0',
    'monthly_machinery_depreciation'  => 'required|numeric|min:0',
    'min_margin_pct'                  => 'required|numeric|min:1|max:100',
]
```

### Model: `ShopConfig.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShopConfig extends Model
{
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
```

### Controller: `ConfigController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\ShopConfig;
use Illuminate\Http\Request;

class ConfigController extends Controller
{
    public function tallerShow()
    {
        $config = ShopConfig::current();
        return view('config.taller', compact('config'));
    }

    public function tallerUpdate(Request $request)
    {
        $data = $request->validate([
            'rate_carpintero'                => 'required|numeric|min:0',
            'rate_laqueador'                 => 'required|numeric|min:0',
            'rate_cnc'                       => 'required|numeric|min:0',
            'rate_auxiliar_carp'             => 'required|numeric|min:0',
            'rate_auxiliar_laq'              => 'required|numeric|min:0',
            'rate_administrativo'            => 'required|numeric|min:0',
            'monthly_rent'                   => 'required|numeric|min:0',
            'monthly_electricity'            => 'required|numeric|min:0',
            'monthly_machinery_depreciation' => 'required|numeric|min:0',
            'min_margin_pct'                 => 'required|numeric|min:1|max:100',
        ]);

        $config = ShopConfig::current();
        $config->update(array_merge($data, ['updated_at' => now()]));

        return back()->with('success', 'Configuración del taller actualizada.');
    }
}
```

### Vista: `config/taller.blade.php`
- Título: "Configuración del Taller"
- Sección "Tarifas de Mano de Obra (MXN/hora)": 6 campos numéricos con label, nombre del rol y valor actual
- Sección "Costos Fijos Mensuales (MXN)": Renta, Luz, Amortización maquinaria
- Sección "Umbrales": % mínimo de margen (campo numérico)
- Mostrar cálculo dinámico: "Costo indirecto diario estimado: $XXX MXN" (22 días hábiles)
- Botón "Guardar cambios"

---

## Sub-módulo B: Semáforo de Margen (Catálogo de Productos)

### Reglas de Negocio

**RN-01:** El semáforo compara `sale_price` (manual) vs `estimated_cost` (calculado o ingresado):
```
margin_pct = (sale_price - estimated_cost) / sale_price × 100
```

**RN-02:** Lógica de color:

| Condición | Color | Significado |
|-----------|-------|-------------|
| `margin_pct >= min_margin_pct` | 🟢 Verde | Rentable |
| `margin_pct >= (min_margin_pct - 10)` | 🟡 Amarillo | Margen apretado |
| `margin_pct < (min_margin_pct - 10)` | 🔴 Rojo | Pérdida o muy bajo |

Ejemplo con `min_margin_pct = 35%`:
- Verde: margen ≥ 35%
- Amarillo: margen entre 25% y 34.99%
- Rojo: margen < 25%

**RN-03:** En MVP, `estimated_cost` lo ingresa Carlos manualmente. En Sprint 3 se calculará automáticamente sumando materiales × tiempos × tarifas de la HV.

**RN-04:** Los 3 productos del seed tienen `estimated_cost = 0` → el semáforo los marca como "sin datos" hasta que Carlos ingrese los costos.

**RN-05:** Si `sale_price = 0` o `estimated_cost = 0`, no calcular semáforo — mostrar badge "Datos incompletos" en gris.

**RN-06:** El semáforo se recalcula cada vez que Carlos guarda el producto (no es en tiempo real).

### Rutas

```
GET  /catalogo                 → lista de productos con semáforo
GET  /catalogo/create          → nuevo producto
POST /catalogo                 → guardar producto
GET  /catalogo/{id}/edit       → editar producto
PUT  /catalogo/{id}            → guardar edición (recalcula semáforo)
```

### Validaciones

```php
[
    'name'           => 'required|string|max:255',
    'sale_price'     => 'required|numeric|min:0',
    'estimated_cost' => 'required|numeric|min:0',
    'notes'          => 'nullable|string',
]
```

### Model: `ProductoCatalogo.php`

```php
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
        if (!$this->sale_price || !$this->estimated_cost) {
            $this->margin_pct = 0;
            $this->margin_status = 'gris';
            return;
        }

        $this->margin_pct = (($this->sale_price - $this->estimated_cost) / $this->sale_price) * 100;

        $config = ShopConfig::current();
        $min = (float) $config->min_margin_pct;

        $this->margin_status = match(true) {
            $this->margin_pct >= $min        => 'verde',
            $this->margin_pct >= ($min - 10) => 'amarillo',
            default                          => 'rojo',
        };
    }

    public function getSemaforoColorAttribute(): string
    {
        return match($this->margin_status) {
            'verde'    => 'text-green-600',
            'amarillo' => 'text-yellow-500',
            'rojo'     => 'text-red-600',
            default    => 'text-gray-400',
        };
    }
}
```

### Service: `CostoService.php` (base para Sprint 3)

```php
<?php

namespace App\Services;

use App\Models\ShopConfig;

class CostoService
{
    public function calcularCostoManoObra(string $rol, int $minutos): float
    {
        $config = ShopConfig::current();
        $tarifaHora = match($rol) {
            'carpintero'      => (float) $config->rate_carpintero,
            'laqueador'       => (float) $config->rate_laqueador,
            'cnc'             => (float) $config->rate_cnc,
            'auxiliar_carp'   => (float) $config->rate_auxiliar_carp,
            'auxiliar_laq'    => (float) $config->rate_auxiliar_laq,
            'administrativo'  => (float) $config->rate_administrativo,
            default           => 0,
        };
        return $tarifaHora * ($minutos / 60);
    }
}
```

### Vista: `catalogo/index.blade.php`
- Título: "Catálogo de Productos — Semáforo de Rentabilidad"
- Tabla: Producto | Precio Venta | Costo Estimado | Margen % | Semáforo | Acciones
- Semáforo: círculo de color grande (rojo/amarillo/verde/gris) con el % al lado
- Si `margin_status = 'gris'`: "Datos incompletos — ingresa precio de costo"
- Nota informativa: "Margen mínimo configurado: XX% — cambiar en Configuración del Taller"
- Botón "Nuevo producto"

---

## Criterios de Aceptación del Sprint 2 — Partes B y C

1. Carlos puede guardar la configuración del taller — tarifas actualizadas persisten.
2. El costo indirecto diario se muestra calculado: si renta=$5,000 + luz=$1,000 + depreciación=$2,000 → $363.64/día.
3. Carlos actualiza el costo estimado del "Mueble Pink Up" a $6,100 → margen = (9367-6100)/9367 = 34.87% → **Amarillo** (justo debajo del 35%).
4. Carlos sube precio a $9,500 → margen = (9500-6100)/9500 = 35.8% → **Verde**.
5. Un producto con `estimated_cost = 0` muestra "Datos incompletos" en gris.
6. Si Carlos cambia `min_margin_pct` de 35% a 30% → el mismo producto que era Amarillo al 34.87% pasa a Verde.

---

## Lo que NO hace este módulo

- No calcula costos automáticamente desde tiempos de HV (Sprint 3).
- No lee facturas SAT para actualizar `estimated_cost` (Sprint 4).
- No genera cotizaciones (Fase 2).

---

*Spec version: 1.0 — 2026-06-14*
