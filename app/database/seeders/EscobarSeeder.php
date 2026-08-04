<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EscobarSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('shop_config')->insert([
            'rate_carpintero'                => 88.00,
            'rate_laqueador'                 => 77.00,
            'rate_cnc'                       => 66.00,
            'rate_auxiliar_carp'             => 48.00,
            'rate_auxiliar_laq'              => 45.00,
            'rate_administrativo'            => 75.00,
            'monthly_rent'                   => 0,
            'monthly_electricity'            => 0,
            'monthly_machinery_depreciation' => 0,
            'min_margin_pct'                 => 35.00,
            'updated_at'                     => now(),
        ]);

        DB::table('products_catalog')->insert([
            ['name' => 'Mueble Pink Up',                     'sale_price' => 9367.00, 'estimated_cost' => 0, 'margin_pct' => 0, 'margin_status' => 'verde', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Exhibidor de Lentes',                'sale_price' => 6000.00, 'estimated_cost' => 0, 'margin_pct' => 0, 'margin_status' => 'verde', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Estructura SkinCare con Entrepaños',  'sale_price' => 1300.00, 'estimated_cost' => 0, 'margin_pct' => 0, 'margin_status' => 'verde', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $materiales = [
            ['code' => 'MDF-15MM-MAPLE',      'name' => 'MDF 15mm Maple',            'category' => 'A', 'unit' => 'tablero', 'cost_unit' => 792.00, 'stock_current' => 0, 'stock_min' => 5],
            ['code' => 'MDF-6MM',             'name' => 'MDF 6mm',                   'category' => 'A', 'unit' => 'tablero', 'cost_unit' => 209.00, 'stock_current' => 0, 'stock_min' => 5],
            ['code' => 'MDF-15MM-ENC-BLANCO', 'name' => 'MDF Enchapado Blanco 15mm', 'category' => 'A', 'unit' => 'tablero', 'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 3],
            ['code' => 'BISAGRA-BID',         'name' => 'Bisagra bidimensional',      'category' => 'B', 'unit' => 'pza',     'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 20],
            ['code' => 'BISAGRA-CUELLO0',     'name' => 'Bisagra cuello cero',        'category' => 'B', 'unit' => 'pza',     'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 20],
            ['code' => 'PATAS-GRISES',        'name' => 'Patas grises',               'category' => 'B', 'unit' => 'pza',     'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 10],
            ['code' => 'TORNILLOS',           'name' => 'Tornillos (caja)',            'category' => 'B', 'unit' => 'caja',    'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 2],
            ['code' => 'LACA',                'name' => 'Laca',                       'category' => 'C', 'unit' => 'lts',     'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 5],
            ['code' => 'TINTA-ROJO',          'name' => 'Tinta roja',                 'category' => 'C', 'unit' => 'lts',     'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 1],
            ['code' => 'TINTA-NEGRO',         'name' => 'Tinta negra',                'category' => 'C', 'unit' => 'lts',     'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 1],
            ['code' => 'SOLVENTE',            'name' => 'Solvente',                   'category' => 'C', 'unit' => 'lts',     'cost_unit' => 0,      'stock_current' => 0, 'stock_min' => 3],
        ];

        foreach ($materiales as $m) {
            DB::table('materials')->insert(array_merge($m, [
                'notes'      => null,
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
