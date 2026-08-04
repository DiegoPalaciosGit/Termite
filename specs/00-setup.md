# Spec 00 — Setup Inicial

**Objetivo:** Laravel corriendo localmente, conectado a Supabase, con login de Carlos funcionando.  
**Responsable:** Diego + Gael juntos.  
**Estimado:** 2 horas.

---

## Criterios de Aceptación

1. `php artisan serve` levanta en `localhost:8000` sin errores.
2. Login en `/login` con `carlos@escobar.com` redirige al dashboard.
3. `php artisan migrate` corre sin errores contra Supabase PostgreSQL.
4. Las 8 tablas del schema existen en Supabase (`clients`, `hojas_viajeras`, `hoja_stages`, `materials`, `material_movements`, `shop_config`, `products_catalog`, más las de Breeze).
5. `shop_config` tiene exactamente 1 fila con las tarifas reales de Escobar.

---

## Lo que NO entra en este setup

- No crear vistas ni controllers aún.
- No implementar lógica de negocio.
- No instalar paquetes que no sean Breeze y Livewire.

---

## Checklist de Tareas

### 1. Crear proyecto

```bash
composer create-project laravel/laravel termite
cd termite
git init
git remote add origin [url-del-repo]
```

### 2. Instalar Breeze

```bash
composer require laravel/breeze --dev
php artisan breeze:install blade
npm install && npm run build
```

### 3. Instalar Livewire

```bash
composer require livewire/livewire
```

### 4. Configurar `.env`

```env
APP_NAME=Termite
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=[host-supabase].supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=[password-supabase]
```

> El host y password están en Supabase → Project Settings → Database.

### 5. Agregar campo `role` a la migración de users

Antes de correr `php artisan migrate`, editar la migración de users que generó Breeze:

```php
// En create_users_table migration, dentro de Schema::create():
$table->string('role')->default('admin'); // admin | worker | client
```

### 6. Crear las 7 migraciones adicionales

Ver schema completo en `MVP_PLAN.md` — Sección 5.

Nombres de archivos:
```
2026_06_14_000100_create_clients_table.php
2026_06_14_000200_create_hojas_viajeras_table.php
2026_06_14_000300_create_hoja_stages_table.php
2026_06_14_000400_create_materials_table.php
2026_06_14_000500_create_material_movements_table.php
2026_06_14_000600_create_shop_config_table.php
2026_06_14_000700_create_products_catalogo_table.php
```

```bash
php artisan make:migration create_clients_table
php artisan make:migration create_hojas_viajeras_table
php artisan make:migration create_hoja_stages_table
php artisan make:migration create_materials_table
php artisan make:migration create_material_movements_table
php artisan make:migration create_shop_config_table
php artisan make:migration create_productos_catalogo_table
```

### 7. Correr migraciones y seed

```bash
php artisan migrate
php artisan db:seed --class=EscobarSeeder
```

### 8. Crear usuario Carlos

```bash
php artisan tinker
>>> User::create([
...     'name' => 'Carlos Escobar',
...     'email' => 'carlos@escobar.com',
...     'password' => bcrypt('termite2026'),
...     'role' => 'admin'
... ]);
```

### 9. Verificar

```bash
php artisan serve
# Ir a localhost:8000/login
# Entrar con carlos@escobar.com / termite2026
# Debe mostrar el dashboard de Breeze (vacío está bien)
```

---

## Seeder: `EscobarSeeder.php`

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EscobarSeeder extends Seeder
{
    public function run(): void
    {
        // shop_config singleton
        DB::table('shop_config')->insert([
            'rate_carpintero'              => 88.00,
            'rate_laqueador'               => 77.00,
            'rate_cnc'                     => 66.00,
            'rate_auxiliar_carp'           => 48.00,
            'rate_auxiliar_laq'            => 45.00,
            'rate_administrativo'          => 75.00,
            'monthly_rent'                 => 0,
            'monthly_electricity'          => 0,
            'monthly_machinery_depreciation' => 0,
            'min_margin_pct'               => 35.00,
            'updated_at'                   => now(),
        ]);

        // Productos catálogo
        DB::table('products_catalog')->insert([
            ['name' => 'Mueble Pink Up',                    'sale_price' => 9367.00, 'estimated_cost' => 0, 'margin_pct' => 0, 'margin_status' => 'verde', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Exhibidor de Lentes',               'sale_price' => 6000.00, 'estimated_cost' => 0, 'margin_pct' => 0, 'margin_status' => 'verde', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Estructura SkinCare con Entrepaños', 'sale_price' => 1300.00, 'estimated_cost' => 0, 'margin_pct' => 0, 'margin_status' => 'verde', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Materiales — Categoría A
        $materiales = [
            ['code' => 'MDF-15MM-MAPLE',       'name' => 'MDF 15mm Maple',             'category' => 'A', 'unit' => 'tablero', 'cost_unit' => 792.00, 'stock_current' => 0, 'stock_min' => 5],
            ['code' => 'MDF-6MM',              'name' => 'MDF 6mm',                    'category' => 'A', 'unit' => 'tablero', 'cost_unit' => 209.00, 'stock_current' => 0, 'stock_min' => 5],
            ['code' => 'MDF-15MM-ENC-BLANCO',  'name' => 'MDF Enchapado Blanco 15mm',  'category' => 'A', 'unit' => 'tablero', 'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 3],
            // Categoría B
            ['code' => 'BISAGRA-BID',          'name' => 'Bisagra bidimensional',       'category' => 'B', 'unit' => 'pza',     'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 20],
            ['code' => 'BISAGRA-CUELLO0',      'name' => 'Bisagra cuello cero',         'category' => 'B', 'unit' => 'pza',     'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 20],
            ['code' => 'PATAS-GRISES',         'name' => 'Patas grises',                'category' => 'B', 'unit' => 'pza',     'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 10],
            ['code' => 'TORNILLOS',            'name' => 'Tornillos (caja)',             'category' => 'B', 'unit' => 'caja',    'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 2],
            // Categoría C
            ['code' => 'LACA',                 'name' => 'Laca',                        'category' => 'C', 'unit' => 'lts',     'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 5],
            ['code' => 'TINTA-ROJO',           'name' => 'Tinta roja',                  'category' => 'C', 'unit' => 'lts',     'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 1],
            ['code' => 'TINTA-NEGRO',          'name' => 'Tinta negra',                 'category' => 'C', 'unit' => 'lts',     'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 1],
            ['code' => 'SOLVENTE',             'name' => 'Solvente',                    'category' => 'C', 'unit' => 'lts',     'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 3],
        ];

        foreach ($materiales as $m) {
            DB::table('materials')->insert(array_merge($m, [
                'notes' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
```

---

*Spec version: 1.0 — 2026-06-14*
