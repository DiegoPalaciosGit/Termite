<?php

namespace App\Http\Controllers;

use App\Models\HojaViajera;
use App\Models\HojaStage;
use Illuminate\Http\Request;

class HojaStageController extends Controller
{
    public function store(Request $request, HojaViajera $hoja)
    {
        $request->validate([
            'stage'       => 'required|in:corte,lijado,laca,ensamble,emplayado',
            'worker_name' => 'nullable|string|max:100',
            'started_at'  => 'nullable|date',
            'finished_at' => 'nullable|date|after_or_equal:started_at',
            'notes'       => 'nullable|string',
        ]);

        $hoja->stages()->create($request->only(['stage', 'worker_name', 'started_at', 'finished_at', 'notes']));

        return back()->with('success', 'Etapa registrada.');
    }

    public function destroy(HojaViajera $hoja, HojaStage $stage)
    {
        abort_unless($stage->hoja_viajera_id === $hoja->id, 403);
        $stage->delete();
        return back()->with('success', 'Registro eliminado.');
    }
}
