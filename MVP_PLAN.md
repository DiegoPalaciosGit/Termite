# Termite — Plan de Desarrollo MVP

> **Objetivo de este documento:** Guía clara y ejecutable para arrancar el desarrollo de Termite esta tarde.
> Piloto: Carpintería Escobar (Carlos, 14 personas, Zapopan Jalisco).

---

## 1. Contexto y Problema que Resolvemos

Carlos gestiona su carpintería con Excel y papeles. Los tres dolores más costosos:

1. **No sabe el estado de sus órdenes en tiempo real** — tiene que preguntar físicamente a cada carpintero.
2. **El inventario se lleva mentalmente** — resulta en merma del 10% por mal control.
3. **No conoce la rentabilidad real de sus proyectos** — fija precios a ojo.

Termite reemplaza esos tres procesos con una app web responsiva que Carlos usa desde su celular.

---

## 2. Stack Decidido

| Capa | Tecnología | Razón |
|------|-----------|-------|
| Backend | **Laravel (PHP)** | Gael lo domina; la lectura IMAP/XML del SAT requiere Laravel |
| Frontend | **Blade + Livewire** | Sin separación frontend/backend para MVP — una sola app |
| Base de datos | **PostgreSQL** en Supabase | Infraestructura ya conocida del equipo Apery |
| Auth | **Laravel Breeze** | Login listo en 10 minutos |
| Deploy | **Vercel** (o Railway) | CI/CD automático desde GitHub |
| QR Scan (futuro) | API de cámara del navegador | Sin app nativa — funciona en Safari/Chrome móvil |

**No incluimos en MVP:** Next.js/React separado, PWA, app móvil nativa. Blade + Livewire es suficiente para que Carlos lo use solo desde su celular.

---

## 3. Metodología de Desarrollo (SDD Simplificado)

Usamos la estructura de **OpenSpec** (LIDR Academy) adaptada para un equipo de 2:

Para cada módulo, antes de escribir código:
1. **`spec.md`** — qué hace el módulo, reglas de negocio clave, qué NO hace
2. **`tasks.md`** — checklist de pasos exactos con comandos

Esto evita que Gael y Diego trabajen en paralelo sobre suposiciones distintas.

**Carpeta de specs:** `Termite/specs/` (crear hoy)

```
Termite/specs/
├── 00-setup.md
├── 01-hojas-viajeras.md
├── 02-inventario.md
├── 03-costos.md
└── 04-sat-reader.md   (Sprint 4, no hoy)
```

---

## 4. Alcance del MVP (Lo que Carlos puede usar en 2-3 semanas)

### Lo que SÍ entra al MVP

| Módulo | Descripción | Prioridad |
|--------|-------------|-----------|
| **Auth** | Login único para Carlos (admin) | 🔴 Hoy |
| **Dashboard** | Resumen: órdenes activas, alertas de stock | 🔴 Hoy |
| **Hojas Viajeras** | Crear/ver órdenes, registrar fases, marcar status | 🔴 Sprint 1 |
| **Inventario básico** | Catálogo ABC, entradas/salidas manuales | 🟡 Sprint 2 |
| **Configuración de costos** | Tarifas de mano de obra + indirectos fijos | 🟡 Sprint 2 |
| **Semáforo de margen** | Alerta cuando el margen baja del 35% | 🟡 Sprint 2 |

### Lo que se DIFIERE (Fase 2)

| Módulo | Razón para diferir |
|--------|-------------------|
| F3: Lector SAT / IMAP | Requiere integración con Gmail API — complejo, no bloquea el valor core |
| QR Scanning físico | Requiere imprimir QRs para cada material — operacional, no de código |
| Portal del Trabajador | Carlos tiene que validar el flujo primero antes de involucrar a su equipo |
| Portal del Cliente | Fase 2 completa |
| Fórmulas UDG (reorder point) | Necesita datos históricos de 2-3 meses primero |

---

## 5. Base de Datos — Schema Completo

Crear estas migraciones en este orden exacto:

### Migración 1: `users` (viene con Breeze)
```sql
-- Laravel Breeze lo genera automáticamente
-- Solo agregar:
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'admin';
-- Roles: admin, worker (Fase 2), client (Fase 2)
```

### Migración 2: `clients`
```sql
CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Migración 3: `hojas_viajeras`
```sql
CREATE TABLE hojas_viajeras (
    id BIGSERIAL PRIMARY KEY,
    folio VARCHAR(20) UNIQUE NOT NULL,        -- HV-2026-001, HV-2026-002...
    client_id BIGINT REFERENCES clients(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(30) DEFAULT 'en_proceso',  -- en_proceso | retrabajo | terminado
    notes TEXT,
    estimated_end_date DATE,
    actual_end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Migración 4: `hoja_stages` (bitácora de tiempos por fase)
```sql
CREATE TABLE hoja_stages (
    id BIGSERIAL PRIMARY KEY,
    hoja_viajera_id BIGINT NOT NULL REFERENCES hojas_viajeras(id) ON DELETE CASCADE,
    stage VARCHAR(30) NOT NULL,   -- corte | lijado | laca | ensamble | emplayado
    worker_name VARCHAR(100),     -- nombre libre (Fase 2 vincula a users)
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    duration_minutes INTEGER,     -- calculado automáticamente si se registran ambas fechas
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Migración 5: `materials`
```sql
CREATE TABLE materials (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,         -- MDF-15MM, BISAGRA-CUELLO-0...
    name VARCHAR(255) NOT NULL,
    category CHAR(1) NOT NULL,                -- A | B | C
    unit VARCHAR(20) NOT NULL DEFAULT 'pza',  -- pza | m2 | lts | kg
    cost_unit DECIMAL(10,2) DEFAULT 0,        -- precio actual (se actualiza con facturas)
    stock_current DECIMAL(10,3) DEFAULT 0,
    stock_min DECIMAL(10,3) DEFAULT 0,        -- alerta cuando se llega aquí
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Migración 6: `material_movements`
```sql
CREATE TABLE material_movements (
    id BIGSERIAL PRIMARY KEY,
    material_id BIGINT NOT NULL REFERENCES materials(id),
    type VARCHAR(10) NOT NULL,                -- entrada | salida
    quantity DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2),                  -- costo unitario al momento del movimiento (PEPS)
    reference_type VARCHAR(50),               -- hoja_viajera | factura | ajuste
    reference_id BIGINT,                      -- ID del registro relacionado
    notes TEXT,
    user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Migración 7: `shop_config` (singleton — solo 1 fila)
```sql
CREATE TABLE shop_config (
    id BIGSERIAL PRIMARY KEY,
    -- Tarifas por hora (MXN) — precargadas con datos reales de Escobar
    rate_carpintero DECIMAL(8,2) DEFAULT 88.00,
    rate_laqueador DECIMAL(8,2) DEFAULT 77.00,
    rate_cnc DECIMAL(8,2) DEFAULT 66.00,
    rate_auxiliar_carp DECIMAL(8,2) DEFAULT 48.00,
    rate_auxiliar_laq DECIMAL(8,2) DEFAULT 45.00,
    rate_administrativo DECIMAL(8,2) DEFAULT 75.00,
    -- Costos fijos mensuales (MXN)
    monthly_rent DECIMAL(10,2) DEFAULT 0,
    monthly_electricity DECIMAL(10,2) DEFAULT 0,
    monthly_machinery_depreciation DECIMAL(10,2) DEFAULT 0,
    -- Umbral de margen mínimo
    min_margin_pct DECIMAL(5,2) DEFAULT 35.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Insertar la fila singleton al hacer seed
INSERT INTO shop_config DEFAULT VALUES;
```

### Migración 8: `products_catalog` (F2 — Semáforo)
```sql
CREATE TABLE products_catalog (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sale_price DECIMAL(10,2) NOT NULL,         -- precio de venta manual de Carlos
    estimated_cost DECIMAL(10,2) DEFAULT 0,    -- calculado por el sistema
    margin_pct DECIMAL(5,2) DEFAULT 0,         -- calculado: (sale_price - cost) / sale_price * 100
    margin_status VARCHAR(10) DEFAULT 'verde',  -- verde | amarillo | rojo
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Seed con los 3 productos de Carlos
INSERT INTO products_catalog (name, sale_price) VALUES
    ('Mueble Pink Up', 9367.00),
    ('Exhibidor de Lentes', 6000.00),
    ('Estructura SkinCare con Entrepaños', 1300.00);
```

---

## 6. Fases de Desarrollo

### Setup Inicial (Hoy — 2 horas) — Diego + Gael juntos

**Objetivo:** Laravel corriendo localmente con login y la estructura base.

```bash
# 1. Crear proyecto Laravel
composer create-project laravel/laravel termite
cd termite

# 2. Instalar Breeze (auth scaffolding)
composer require laravel/breeze --dev
php artisan breeze:install blade  # Blade + AlpineJS
npm install && npm run dev

# 3. Instalar Livewire (componentes reactivos para formularios)
composer require livewire/livewire

# 4. Conectar a Supabase PostgreSQL
# En .env:
# DB_CONNECTION=pgsql
# DB_HOST=[tu-host-supabase]
# DB_PORT=5432
# DB_DATABASE=postgres
# DB_USERNAME=postgres
# DB_PASSWORD=[tu-password]

# 5. Correr migraciones en orden
php artisan migrate

# 6. Crear usuario admin inicial
php artisan tinker
User::create(['name' => 'Carlos', 'email' => 'carlos@escobar.com', 'password' => bcrypt('password'), 'role' => 'admin']);
```

**Entregable:** Puedes entrar a `localhost:8000` con login y ver el dashboard vacío.

---

### Sprint 1 — Hojas Viajeras (Días 1-5) — Gael ejecuta

Este es el módulo más importante. Carlos empieza a registrar TODAS sus órdenes aquí.

**Rutas a crear:**
```
GET  /hojas                  → lista de hojas viajeras
GET  /hojas/create           → formulario nueva hoja
POST /hojas                  → guardar nueva hoja
GET  /hojas/{id}             → detalle + bitácora de etapas
POST /hojas/{id}/stages      → registrar inicio/fin de una fase
PATCH /hojas/{id}/status     → cambiar status (en_proceso/retrabajo/terminado)
```

**Lógica de folio automático:**
```php
// En HojaViajera::boot()
static::creating(function ($hoja) {
    $year = now()->year;
    $last = static::whereYear('created_at', $year)->count();
    $hoja->folio = 'HV-' . $year . '-' . str_pad($last + 1, 3, '0', STR_PAD_LEFT);
});
```

**Las 5 etapas (hardcodeadas, no configurables en MVP):**
```php
const STAGES = [
    'corte'     => 'Corte (CNC / Sierra)',
    'lijado'    => 'Lijado / Porosidad',
    'laca'      => 'Laca / Pintura',
    'ensamble'  => 'Ensamble / Herrajes',
    'emplayado' => 'Emplayado y Almacén',
];
```

**Lógica de duración automática:**
```php
// Cuando se registra finished_at
if ($stage->started_at && $stage->finished_at) {
    $stage->duration_minutes = $stage->started_at->diffInMinutes($stage->finished_at);
}
```

**Entregable Sprint 1:** Carlos puede crear una orden (HV-2026-001) para un "Mueble Pink Up" para cliente "Inés", marcar que el carpintero Miguel terminó el corte en 45 minutos, y ver en el dashboard cuántas órdenes están en proceso.

---

### Sprint 2 — Inventario + Costos (Días 6-12) — Gael ejecuta

**Parte A: Inventario**

Rutas:
```
GET  /materiales              → lista ABC con stock actual
GET  /materiales/create       → nuevo material
POST /materiales              → guardar
POST /materiales/{id}/entrada → registrar entrada de material
POST /materiales/{id}/salida  → registrar salida de material
GET  /materiales/{id}/movimientos → historial PEPS
```

**Lógica PEPS (en `InventarioService`):**
```php
// Al registrar una SALIDA, consumir el lote más antiguo primero
public function registrarSalida(Material $material, float $cantidad): void {
    $entradas = MaterialMovement::where('material_id', $material->id)
        ->where('type', 'entrada')
        ->where('remaining', '>', 0)
        ->orderBy('created_at', 'asc')
        ->get();
    
    // Ir consumiendo de las entradas más antiguas
    // Actualizar remaining en cada entrada
    // Calcular costo promedio ponderado de la salida
}
```

*(Para MVP, puedes simplificar: llevar solo `stock_current` y `cost_unit` promedio — PEPS completo en Sprint 3)*

**Parte B: Configuración de costos**

Ruta única:
```
GET/POST /config/taller → formulario singleton de shop_config
```

**Parte C: Semáforo de margen**

```php
// En ProductoCatalog: recalcular al guardar
public function calcularMargen(): void {
    if ($this->sale_price > 0) {
        $this->margin_pct = (($this->sale_price - $this->estimated_cost) / $this->sale_price) * 100;
        $config = ShopConfig::first();
        $this->margin_status = match(true) {
            $this->margin_pct >= $config->min_margin_pct => 'verde',
            $this->margin_pct >= ($config->min_margin_pct - 10) => 'amarillo',
            default => 'rojo',
        };
    }
}
```

**Entregable Sprint 2:** Carlos puede ver que tiene 12 tableros de MDF 15mm en stock, que le quedan 3 (alerta roja), y que el Mueble Pink Up tiene margen del 32% (amarillo — debería subir precio o reducir costo).

---

### Sprint 3 — Polish + Deploy (Días 13-18)

- Conectar el costo real de una Hoja Viajera (sumar tiempos × tarifas + proporción de indirectos)
- Dashboard con métricas clave: órdenes activas, órdenes retrabajo (rojo), materiales en alerta
- QR codes para materiales (generar e imprimir — librería `simplesoftwareio/simple-qrcode`)
- Deploy en Railway (más fácil que Vercel para Laravel) o Laravel Forge
- Seed de datos reales de Carlos: materiales con sus precios actuales, 3 productos del catálogo

---

### Sprint 4 — Lector SAT (Semana 4-5, con más tiempo)

Solo arrancar cuando el MVP esté validado por Carlos.

```
F3: IMAP → Gmail → Adjuntos XML → Parse CFDI → Actualizar precios en materials
```

Librería: `webklex/laravel-imap`
XML parsing: `simplexml_load_string()` nativo de PHP, buscar `cfdi:Concepto`

---

## 7. Estructura de Carpetas Laravel

```
app/
├── Http/Controllers/
│   ├── DashboardController.php
│   ├── HojaViajeraController.php
│   ├── HojaStageController.php
│   ├── MaterialController.php
│   ├── MovimientoController.php
│   ├── ProductoCatalogoController.php
│   └── ConfigController.php
├── Models/
│   ├── User.php
│   ├── Client.php
│   ├── HojaViajera.php
│   ├── HojaStage.php
│   ├── Material.php
│   ├── MaterialMovement.php
│   ├── ProductoCatalogo.php
│   └── ShopConfig.php
└── Services/
    ├── InventarioService.php      ← PEPS, alertas de stock
    ├── CostoService.php           ← cálculo de margen, costo por HV
    └── FolioService.php           ← generación de folios HV-YYYY-NNN

resources/views/
├── dashboard/
│   └── index.blade.php
├── hojas/
│   ├── index.blade.php            ← lista de órdenes
│   ├── create.blade.php           ← nueva hoja
│   └── show.blade.php             ← detalle + etapas
├── materiales/
│   ├── index.blade.php
│   └── show.blade.php
├── catalogo/
│   └── index.blade.php            ← semáforo de productos
└── config/
    └── taller.blade.php

database/migrations/
├── 2026_06_14_001_create_clients_table.php
├── 2026_06_14_002_create_hojas_viajeras_table.php
├── 2026_06_14_003_create_hoja_stages_table.php
├── 2026_06_14_004_create_materials_table.php
├── 2026_06_14_005_create_material_movements_table.php
├── 2026_06_14_006_create_shop_config_table.php
└── 2026_06_14_007_create_productos_catalogo_table.php
```

---

## 8. Datos de Seed (Reales de Carlos)

Crear `database/seeders/EscobarSeeder.php`:

**Materiales precargados (Categoría A):**
| Código | Nombre | Precio actual |
|--------|--------|---------------|
| MDF-15MM-MAPLE | MDF 15mm Maple | $792 MXN/tablero |
| MDF-6MM | MDF 6mm | $209 MXN/tablero |
| MDF-15MM-ENC-BLANCO | MDF Enchapado Blanco 15mm | (confirmar con Carlos) |

**Categoría B:**
| Código | Nombre | Precio |
|--------|--------|--------|
| BISAGRA-BID | Bisagra bidimensional | (confirmar) |
| BISAGRA-CUELLO0 | Bisagra cuello cero | (confirmar) |
| PATAS-GRISES | Patas grises | (confirmar) |
| TORNILLOS | Tornillos (caja) | (confirmar) |

**Categoría C:**
| Código | Nombre | Precio |
|--------|--------|--------|
| LACA | Laca | (confirmar) |
| TINTA-ROJO | Tinta roja | (confirmar) |
| TINTA-NEGRO | Tinta negra | (confirmar) |
| SOLVENTE | Solvente | (confirmar) |

---

## 9. División de Trabajo Diego / Gael

| Tarea | Quién |
|-------|-------|
| Setup Laravel + Supabase | **Juntos hoy** |
| Migraciones + Models + Seeders | **Gael** |
| Controllers + Routes + Blade views | **Gael** |
| Servicios (InventarioService, CostoService) | **Gael** |
| Definición de specs por módulo | **Diego** (escribe `specs/*.md` antes de que Gael codee) |
| Validación de lógica de negocio | **Diego** (confirma con Carlos qué datos son correctos) |
| QA / Pruebas manuales | **Diego** |
| Deploy + CI/CD | **Juntos** |

---

## 10. Cómo Usar Claude/Cursor Esta Tarde

### Para Gael (generación de código):
```
Prompt tipo: "Soy desarrollador Laravel. Crea el Model y Migration de HojaViajera 
con los campos: id, folio (unique), client_id FK, product_name, quantity, status 
(enum: en_proceso/retrabajo/terminado), notes, estimated_end_date, actual_end_date.
Incluye el boot() que genera el folio automático como HV-{year}-{NNN}."
```

### Para Diego (specs rápidas):
```
Prompt tipo: "Escribe el spec técnico para el módulo de Inventario de Termite.
El módulo maneja: catálogo de materiales ABC, movimientos entrada/salida, 
método PEPS, alerta cuando stock llega al mínimo. 
Output: spec.md con reglas de negocio, rutas, y checklist de tareas."
```

---

## 11. Checklist de Arranque Hoy

- [ ] Crear repo privado en GitHub: `Apery-BS/termite` (o cuenta personal Gael)
- [ ] `composer create-project laravel/laravel termite`
- [ ] Instalar Breeze + Livewire
- [ ] Configurar `.env` con Supabase credentials
- [ ] Correr `php artisan migrate` con las 8 migraciones
- [ ] Crear usuario Carlos: `php artisan tinker`
- [ ] Confirmar que login funciona en `localhost:8000`
- [ ] Crear `specs/01-hojas-viajeras.md` (Diego escribe, Gael valida)
- [ ] Gael empieza `HojaViajeraController` + vistas

---

*Plan generado: 2026-06-14 | Versión: 1.0*
*Próxima revisión: al terminar Sprint 1 — validar con Carlos antes de Sprint 2.*
