<?php

namespace App\Http\Controllers;

use App\Models\ProductoCatalogo;
use Illuminate\Http\Request;

class ProductoCatalogoController extends Controller
{
    public function index()
    {
        $productos = ProductoCatalogo::where('is_active', true)->orderBy('name')->get();
        return view('catalogo.index', compact('productos'));
    }

    public function create()
    {
        return view('catalogo.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'sale_price'     => 'required|numeric|min:0',
            'estimated_cost' => 'required|numeric|min:0',
            'notes'          => 'nullable|string',
        ]);

        ProductoCatalogo::create(array_merge($data, ['is_active' => true]));

        return redirect()->route('catalogo.index')->with('success', 'Producto creado.');
    }

    public function edit(ProductoCatalogo $catalogo)
    {
        return view('catalogo.edit', compact('catalogo'));
    }

    public function update(Request $request, ProductoCatalogo $catalogo)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'sale_price'     => 'required|numeric|min:0',
            'estimated_cost' => 'required|numeric|min:0',
            'notes'          => 'nullable|string',
        ]);

        $catalogo->update($data);

        return redirect()->route('catalogo.index')->with('success', 'Producto actualizado.');
    }
}
