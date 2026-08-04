<?php

namespace App\Http\Controllers;

use App\Models\HojaViajera;
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
