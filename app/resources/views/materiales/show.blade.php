<x-app-layout>
    <x-slot name="header">
        <div class="flex justify-between items-center">
            <div>
                <h2 class="font-semibold text-xl text-gray-800">{{ $material->name }}</h2>
                <p class="text-xs text-gray-400 font-mono mt-1">{{ $material->code }} · Categoría {{ $material->category }}</p>
            </div>
            <a href="{{ route('materiales.edit', $material) }}" class="text-sm text-indigo-600 hover:text-indigo-900">Editar</a>
        </div>
    </x-slot>

    <div class="py-6">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">

            @if(session('success'))
                <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{{ session('success') }}</div>
            @endif
            @if($errors->any())
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{{ $errors->first() }}</div>
            @endif

            {{-- Stock actual --}}
            <div class="bg-white shadow-sm sm:rounded-lg p-6">
                <div class="grid grid-cols-3 gap-6">
                    <div class="text-center">
                        <p class="text-xs text-gray-500 uppercase mb-1">Stock actual</p>
                        <p class="text-3xl font-bold {{ $material->isLowStock() ? 'text-red-600' : 'text-gray-900' }}">
                            {{ (float)$material->stock_current }}
                        </p>
                        <p class="text-sm text-gray-400">{{ $material->unit }}</p>
                        @if($material->isLowStock())
                            <span class="mt-2 inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">⚠️ Stock bajo</span>
                        @endif
                    </div>
                    <div class="text-center">
                        <p class="text-xs text-gray-500 uppercase mb-1">Stock mínimo</p>
                        <p class="text-3xl font-bold text-gray-400">{{ (float)$material->stock_min }}</p>
                        <p class="text-sm text-gray-400">{{ $material->unit }}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-xs text-gray-500 uppercase mb-1">Precio unitario</p>
                        @if($material->hasPendingPrice())
                            <p class="text-lg font-medium text-yellow-600">Pendiente</p>
                        @else
                            <p class="text-2xl font-bold text-gray-900">${{ number_format($material->cost_unit, 2) }}</p>
                        @endif
                    </div>
                </div>
            </div>

            {{-- Formularios entrada/salida --}}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white shadow-sm sm:rounded-lg p-6">
                    <h3 class="text-sm font-semibold text-green-700 mb-3">↑ Registrar Entrada</h3>
                    <form method="POST" action="{{ route('materiales.entrada', $material) }}">
                        @csrf
                        <div class="mb-3">
                            <label class="block text-xs text-gray-600 mb-1">Cantidad ({{ $material->unit }})</label>
                            <input type="number" name="quantity" step="0.001" min="0.001"
                                class="w-full border-gray-300 rounded-md shadow-sm text-sm" required>
                        </div>
                        <div class="mb-3">
                            <label class="block text-xs text-gray-600 mb-1">Costo unitario ($)</label>
                            <input type="number" name="unit_cost" step="0.01" min="0" value="{{ $material->cost_unit }}"
                                class="w-full border-gray-300 rounded-md shadow-sm text-sm" required>
                        </div>
                        <div class="mb-3">
                            <label class="block text-xs text-gray-600 mb-1">Notas</label>
                            <input type="text" name="notes" placeholder="ej. Compra Maximaderas"
                                class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                        </div>
                        <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-md text-sm font-medium hover:bg-green-700">
                            Registrar entrada
                        </button>
                    </form>
                </div>

                <div class="bg-white shadow-sm sm:rounded-lg p-6">
                    <h3 class="text-sm font-semibold text-red-700 mb-3">↓ Registrar Salida</h3>
                    <form method="POST" action="{{ route('materiales.salida', $material) }}">
                        @csrf
                        <div class="mb-3">
                            <label class="block text-xs text-gray-600 mb-1">Cantidad ({{ $material->unit }}) — disponible: {{ (float)$material->stock_current }}</label>
                            <input type="number" name="quantity" step="0.001" min="0.001" max="{{ $material->stock_current }}"
                                class="w-full border-gray-300 rounded-md shadow-sm text-sm" required>
                        </div>
                        <div class="mb-3">
                            <label class="block text-xs text-gray-600 mb-1">Notas</label>
                            <input type="text" name="notes" placeholder="ej. HV-2026-001 Mueble Pink Up"
                                class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                        </div>
                        <button type="submit" class="w-full bg-red-600 text-white py-2 rounded-md text-sm font-medium hover:bg-red-700">
                            Registrar salida
                        </button>
                    </form>
                </div>
            </div>

            {{-- Historial --}}
            <div class="bg-white shadow-sm sm:rounded-lg p-6">
                <h3 class="text-sm font-semibold text-gray-700 mb-4">Historial de movimientos</h3>
                @if($material->movements->count())
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Costo/u</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @foreach($material->movements as $mov)
                                <tr>
                                    <td class="px-4 py-3 text-xs text-gray-500">{{ $mov->created_at->format('d/m/Y H:i') }}</td>
                                    <td class="px-4 py-3">
                                        <span class="px-2 py-1 text-xs rounded-full {{ $mov->type === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                                            {{ $mov->type === 'entrada' ? '↑ Entrada' : '↓ Salida' }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-sm font-medium">{{ (float)$mov->quantity }} {{ $material->unit }}</td>
                                    <td class="px-4 py-3 text-sm text-gray-600">${{ number_format($mov->unit_cost, 2) }}</td>
                                    <td class="px-4 py-3 text-sm text-gray-500">{{ $mov->notes ?? '—' }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                @else
                    <p class="text-sm text-gray-400">Sin movimientos aún.</p>
                @endif
            </div>

            <div class="pb-4">
                <a href="{{ route('materiales.index') }}" class="text-sm text-gray-500 hover:text-gray-700">← Volver a inventario</a>
            </div>

        </div>
    </div>
</x-app-layout>
