<x-app-layout>
    <x-slot name="header">
        <div class="flex justify-between items-center">
            <div>
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">Inventario</h2>
                @if($alertas > 0)
                    <p class="text-sm text-red-600 mt-1">⚠️ {{ $alertas }} {{ $alertas === 1 ? 'material' : 'materiales' }} en alerta de stock</p>
                @endif
            </div>
            <a href="{{ route('materiales.create') }}" class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                + Nuevo material
            </a>
        </div>
    </x-slot>

    <div class="py-6">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">

            @if(session('success'))
                <div class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{{ session('success') }}</div>
            @endif

            @foreach(['A' => 'Categoría A — Alta rotación', 'B' => 'Categoría B — Rotación media', 'C' => 'Categoría C — Baja rotación'] as $cat => $label)
                @php $grupo = $materiales->where('category', $cat); @endphp
                @if($grupo->count())
                    <div class="mb-6">
                        <h3 class="text-sm font-semibold text-gray-500 uppercase mb-2 px-1">{{ $label }}</h3>
                        <div class="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock actual</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mín.</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio/u</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th class="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    @foreach($grupo as $m)
                                        <tr class="{{ $m->isLowStock() ? 'bg-red-50' : '' }}">
                                            <td class="px-6 py-3 text-xs font-mono text-gray-500">{{ $m->code }}</td>
                                            <td class="px-6 py-3 text-sm font-medium text-gray-900">{{ $m->name }}</td>
                                            <td class="px-6 py-3 text-sm font-bold {{ $m->isLowStock() ? 'text-red-700' : 'text-gray-900' }}">
                                                {{ (float)$m->stock_current }} {{ $m->unit }}
                                            </td>
                                            <td class="px-6 py-3 text-sm text-gray-500">{{ (float)$m->stock_min }}</td>
                                            <td class="px-6 py-3 text-sm text-gray-900">
                                                @if($m->hasPendingPrice())
                                                    <span class="text-yellow-600 text-xs">Precio pendiente</span>
                                                @else
                                                    ${{ number_format($m->cost_unit, 2) }}
                                                @endif
                                            </td>
                                            <td class="px-6 py-3">
                                                @if($m->isLowStock())
                                                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">En alerta</span>
                                                @else
                                                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">OK</span>
                                                @endif
                                            </td>
                                            <td class="px-6 py-3 text-right">
                                                <a href="{{ route('materiales.show', $m) }}" class="text-indigo-600 hover:text-indigo-900 text-sm">Ver</a>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                @endif
            @endforeach

        </div>
    </div>
</x-app-layout>
