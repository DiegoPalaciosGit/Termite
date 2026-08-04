<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Services\InventarioService;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
    public function index()
    {
        $materiales = Material::active()->orderBy('category')->orderBy('name')->get();
        $alertas = $materiales->filter(fn($m) => $m->isLowStock())->count();
        return view('materiales.index', compact('materiales', 'alertas'));
    }

    public function create()
    {
        return view('materiales.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'          => 'required|string|max:50|unique:materials,code',
            'name'          => 'required|string|max:255',
            'category'      => 'required|in:A,B,C',
            'unit'          => 'required|string|max:20',
            'cost_unit'     => 'required|numeric|min:0',
            'stock_current' => 'required|numeric|min:0',
            'stock_min'     => 'required|numeric|min:0',
            'notes'         => 'nullable|string',
        ]);

        Material::create(array_merge($data, ['is_active' => true]));

        return redirect()->route('materiales.index')->with('success', 'Material creado.');
    }

    public function show(Material $material)
    {
        $material->load('movements');
        return view('materiales.show', compact('material'));
    }

    public function edit(Material $material)
    {
        return view('materiales.edit', compact('material'));
    }

    public function update(Request $request, Material $material)
    {
        $data = $request->validate([
            'code'          => 'required|string|max:50|unique:materials,code,' . $material->id,
            'name'          => 'required|string|max:255',
            'category'      => 'required|in:A,B,C',
            'unit'          => 'required|string|max:20',
            'cost_unit'     => 'required|numeric|min:0',
            'stock_min'     => 'required|numeric|min:0',
            'notes'         => 'nullable|string',
        ]);

        $material->update($data);

        return redirect()->route('materiales.show', $material)->with('success', 'Material actualizado.');
    }

    public function entradaStore(Request $request, Material $material, InventarioService $inventario)
    {
        $request->validate([
            'quantity'  => 'required|numeric|min:0.001',
            'unit_cost' => 'required|numeric|min:0',
            'notes'     => 'nullable|string',
        ]);

        $inventario->registrarEntrada($material, (float)$request->quantity, (float)$request->unit_cost, $request->notes);

        return back()->with('success', "Entrada registrada. Stock actual: {$material->fresh()->stock_current} {$material->unit}");
    }

    public function salidaStore(Request $request, Material $material, InventarioService $inventario)
    {
        $request->validate([
            'quantity' => 'required|numeric|min:0.001',
            'notes'    => 'nullable|string',
        ]);

        if ((float)$request->quantity > (float)$material->stock_current) {
            return back()->withErrors(['quantity' => "Stock insuficiente. Disponible: {$material->stock_current} {$material->unit}"]);
        }

        $inventario->registrarSalida($material, (float)$request->quantity, 'manual', null, $request->notes);

        return back()->with('success', "Salida registrada. Stock actual: {$material->fresh()->stock_current} {$material->unit}");
    }
}
