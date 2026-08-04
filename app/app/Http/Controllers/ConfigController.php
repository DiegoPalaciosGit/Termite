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

        ShopConfig::current()->update(array_merge($data, ['updated_at' => now()]));

        return back()->with('success', 'Configuración del taller actualizada.');
    }
}
