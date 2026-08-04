<x-app-layout>
    <x-slot name="header">
        <div class="flex justify-between items-center">
            <div>
                <h2 class="font-semibold text-xl text-gray-800 leading-tight font-mono">{{ $hoja->folio }}</h2>
                <p class="text-gray-500 text-sm mt-1">{{ $hoja->product_name }}</p>
            </div>
            <a href="{{ route('hojas.edit', $hoja) }}" class="text-sm text-indigo-600 hover:text-indigo-900">Editar</a>
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

            {{-- Info general --}}
            <div class="bg-white shadow-sm sm:rounded-lg p-6">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p class="text-xs text-gray-500 uppercase">Cliente</p>
                        <p class="font-medium">{{ $hoja->client?->name ?? 'Sin cliente' }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase">Cantidad</p>
                        <p class="font-medium">{{ $hoja->quantity }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase">Fecha estimada</p>
                        <p class="font-medium">{{ $hoja->estimated_end_date?->format('d/m/Y') ?? '—' }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase">Status</p>
                        @php $colors = \App\Models\HojaViajera::STATUS_COLORS; $labels = \App\Models\HojaViajera::STATUS_LABELS; @endphp
                        <span class="px-2 py-1 text-xs font-medium rounded-full {{ $colors[$hoja->status] }}">
                            {{ $labels[$hoja->status] }}
                        </span>
                    </div>
                </div>
                @if($hoja->notes)
                    <p class="mt-4 text-sm text-gray-600 border-t pt-4">{{ $hoja->notes }}</p>
                @endif
            </div>

            {{-- Cambiar status --}}
            @if($hoja->status !== 'terminado')
                <div class="bg-white shadow-sm sm:rounded-lg p-6">
                    <h3 class="text-sm font-medium text-gray-700 mb-3">Cambiar Status</h3>
                    <form method="POST" action="{{ route('hojas.status', $hoja) }}" class="flex gap-2">
                        @csrf @method('PATCH')
                        <select name="status" class="border-gray-300 rounded-md shadow-sm text-sm">
                            <option value="en_proceso" {{ $hoja->status === 'en_proceso' ? 'selected' : '' }}>En Proceso</option>
                            <option value="retrabajo" {{ $hoja->status === 'retrabajo' ? 'selected' : '' }}>Retrabajo</option>
                            <option value="terminado">Terminado</option>
                        </select>
                        <button type="submit" class="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700">Guardar</button>
                    </form>
                </div>
            @endif

            {{-- Bitácora de etapas --}}
            <div class="bg-white shadow-sm sm:rounded-lg p-6">
                <h3 class="text-sm font-medium text-gray-700 mb-4">Bitácora de Producción</h3>

                @if($hoja->stages->count())
                    <table class="min-w-full divide-y divide-gray-200 mb-6">
                        <thead>
                            <tr>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Etapa</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trabajador</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inicio</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fin</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
                                <th class="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @foreach($hoja->stages as $stage)
                                <tr>
                                    <td class="px-4 py-3 text-sm font-medium">{{ $stages[$stage->stage] ?? $stage->stage }}</td>
                                    <td class="px-4 py-3 text-sm text-gray-600">{{ $stage->worker_name ?? '—' }}</td>
                                    <td class="px-4 py-3 text-sm text-gray-600">{{ $stage->started_at?->format('d/m H:i') ?? '—' }}</td>
                                    <td class="px-4 py-3 text-sm text-gray-600">{{ $stage->finished_at?->format('d/m H:i') ?? '—' }}</td>
                                    <td class="px-4 py-3 text-sm font-medium text-indigo-700">{{ $stage->duration_formatted }}</td>
                                    <td class="px-4 py-3 text-sm text-gray-500">{{ $stage->notes ?? '—' }}</td>
                                    <td class="px-4 py-3 text-right">
                                        <form method="POST" action="{{ route('hojas.stages.destroy', [$hoja, $stage]) }}"
                                            onsubmit="return confirm('¿Eliminar este registro?')">
                                            @csrf @method('DELETE')
                                            <button type="submit" class="text-red-500 hover:text-red-700 text-xs">Eliminar</button>
                                        </form>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                @else
                    <p class="text-sm text-gray-400 mb-6">Sin registros de producción aún.</p>
                @endif

                {{-- Formulario nueva etapa --}}
                <div class="border-t pt-4">
                    <h4 class="text-sm font-medium text-gray-700 mb-3">Registrar etapa</h4>
                    <form method="POST" action="{{ route('hojas.stages.store', $hoja) }}">
                        @csrf
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            <div>
                                <label class="block text-xs text-gray-600 mb-1">Etapa *</label>
                                <select name="stage" class="w-full border-gray-300 rounded-md shadow-sm text-sm" required>
                                    @foreach($stages as $key => $label)
                                        <option value="{{ $key }}">{{ $label }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs text-gray-600 mb-1">Trabajador</label>
                                <input type="text" name="worker_name" placeholder="ej. Miguel Márquez"
                                    class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                            </div>
                            <div></div>
                            <div>
                                <label class="block text-xs text-gray-600 mb-1">Inicio</label>
                                <input type="datetime-local" name="started_at"
                                    class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-600 mb-1">Fin</label>
                                <input type="datetime-local" name="finished_at"
                                    class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-600 mb-1">Notas</label>
                                <input type="text" name="notes" placeholder="Opcional"
                                    class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                            </div>
                        </div>
                        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">
                            Registrar etapa
                        </button>
                    </form>
                </div>
            </div>

            <div class="pb-4">
                <a href="{{ route('hojas.index') }}" class="text-sm text-gray-500 hover:text-gray-700">← Volver a lista</a>
            </div>

        </div>
    </div>
</x-app-layout>
