<x-app-layout>
    <x-slot name="header">
        <div class="flex justify-between items-center">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Hojas Viajeras</h2>
            <a href="{{ route('hojas.create') }}" class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                + Nueva HV
            </a>
        </div>
    </x-slot>

    <div class="py-6">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">

            @if(session('success'))
                <div class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {{ session('success') }}
                </div>
            @endif

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folio</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cant.</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Est.</th>
                            <th class="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @forelse($hojas as $hoja)
                            <tr class="{{ $hoja->status === 'retrabajo' ? 'bg-red-50' : '' }}">
                                <td class="px-6 py-4 text-sm font-mono font-medium text-gray-900">{{ $hoja->folio }}</td>
                                <td class="px-6 py-4 text-sm text-gray-900">{{ $hoja->product_name }}</td>
                                <td class="px-6 py-4 text-sm text-gray-500">{{ $hoja->client?->name ?? 'Sin cliente' }}</td>
                                <td class="px-6 py-4 text-sm text-gray-900">{{ $hoja->quantity }}</td>
                                <td class="px-6 py-4">
                                    @php $colors = \App\Models\HojaViajera::STATUS_COLORS; $labels = \App\Models\HojaViajera::STATUS_LABELS; @endphp
                                    <span class="px-2 py-1 text-xs font-medium rounded-full {{ $colors[$hoja->status] }}">
                                        {{ $labels[$hoja->status] }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-500">
                                    {{ $hoja->estimated_end_date?->format('d/m/Y') ?? '—' }}
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <a href="{{ route('hojas.show', $hoja) }}" class="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Ver</a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="px-6 py-8 text-center text-gray-400 text-sm">
                                    No hay hojas viajeras aún. <a href="{{ route('hojas.create') }}" class="text-indigo-600">Crea la primera.</a>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>

                @if($hojas->hasPages())
                    <div class="px-6 py-4 border-t">{{ $hojas->links() }}</div>
                @endif
            </div>

        </div>
    </div>
</x-app-layout>
