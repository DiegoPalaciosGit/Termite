<x-app-layout>
    <x-slot name="header">
        <div class="flex justify-between items-center">
            <h2 class="font-semibold text-xl text-gray-800">Catálogo — Semáforo de Rentabilidad</h2>
            <a href="{{ route('catalogo.create') }}" class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                + Nuevo producto
            </a>
        </div>
    </x-slot>

    <div class="py-6">
        <div class="max-w-5xl mx-auto sm:px-6 lg:px-8">

            @if(session('success'))
                <div class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{{ session('success') }}</div>
            @endif

            <div class="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio venta</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo estimado</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margen</th>
                            <th class="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        @foreach($productos as $p)
                            <tr>
                                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ $p->name }}</td>
                                <td class="px-6 py-4 text-sm text-gray-900">${{ number_format($p->sale_price, 2) }}</td>
                                <td class="px-6 py-4 text-sm text-gray-600">
                                    @if((float)$p->estimated_cost === 0.0)
                                        <span class="text-yellow-600 text-xs">Pendiente</span>
                                    @else
                                        ${{ number_format($p->estimated_cost, 2) }}
                                    @endif
                                </td>
                                <td class="px-6 py-4">
                                    <span class="px-2 py-1 text-sm font-semibold rounded-full {{ $p->semaforo_badge }}">
                                        {{ $p->semaforo_label }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <a href="{{ route('catalogo.edit', $p) }}" class="text-indigo-600 hover:text-indigo-900 text-sm">Editar</a>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <p class="mt-3 text-xs text-gray-400">
                Margen mínimo configurado: <strong>{{ \App\Models\ShopConfig::current()->min_margin_pct }}%</strong>
                — <a href="{{ route('config.taller') }}" class="text-indigo-500 hover:text-indigo-700">Cambiar en Configuración</a>
            </p>

        </div>
    </div>
</x-app-layout>
