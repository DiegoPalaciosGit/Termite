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
            $stockActual = (float) $material->stock_current;
            $costoActual = (float) $material->cost_unit;

            $nuevoCosto = ($stockActual > 0 || $costoActual > 0)
                ? ($stockActual * $costoActual + $cantidad * $costoUnitario) / ($stockActual + $cantidad)
                : $costoUnitario;

            $material->stock_current = $stockActual + $cantidad;
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
        if ($cantidad > (float) $material->stock_current) {
            throw new \Exception("Stock insuficiente. Disponible: {$material->stock_current} {$material->unit}");
        }

        return DB::transaction(function () use ($material, $cantidad, $referenceType, $referenceId, $notas) {
            $material->stock_current = (float) $material->stock_current - $cantidad;
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
