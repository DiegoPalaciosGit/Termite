<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800">Configuración del Taller</h2>
    </x-slot>

    <div class="py-6">
        <div class="max-w-2xl mx-auto sm:px-6 lg:px-8 space-y-6">

            @if(session('success'))
                <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{{ session('success') }}</div>
            @endif

            <form method="POST" action="{{ route('config.taller.update') }}">
                @csrf

                {{-- Tarifas mano de obra --}}
                <div class="bg-white shadow-sm sm:rounded-lg p-6 mb-4">
                    <h3 class="text-sm font-semibold text-gray-700 mb-4">Tarifas de Mano de Obra (MXN/hora)</h3>
                    <div class="grid grid-cols-2 gap-4">
                        @foreach([
                            'rate_carpintero'     => 'Carpintero',
                            'rate_laqueador'      => 'Laqueador',
                            'rate_cnc'            => 'Operador CNC',
                            'rate_auxiliar_carp'  => 'Auxiliar Carpintero',
                            'rate_auxiliar_laq'   => 'Auxiliar Laqueador / Chofer',
                            'rate_administrativo' => 'Administrativo',
                        ] as $field => $label)
                            <div>
                                <label class="block text-xs text-gray-600 mb-1">{{ $label }}</label>
                                <div class="flex items-center">
                                    <span class="text-gray-400 text-sm mr-2">$</span>
                                    <input type="number" name="{{ $field }}" value="{{ old($field, $config->$field) }}"
                                        step="0.01" min="0" class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>

                {{-- Costos fijos --}}
                <div class="bg-white shadow-sm sm:rounded-lg p-6 mb-4">
                    <h3 class="text-sm font-semibold text-gray-700 mb-4">Costos Fijos Mensuales (MXN)</h3>
                    <div class="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-xs text-gray-600 mb-1">Renta</label>
                            <input type="number" name="monthly_rent" value="{{ old('monthly_rent', $config->monthly_rent) }}"
                                step="0.01" min="0" class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-600 mb-1">Luz</label>
                            <input type="number" name="monthly_electricity" value="{{ old('monthly_electricity', $config->monthly_electricity) }}"
                                step="0.01" min="0" class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-600 mb-1">Amortización maquinaria</label>
                            <input type="number" name="monthly_machinery_depreciation" value="{{ old('monthly_machinery_depreciation', $config->monthly_machinery_depreciation) }}"
                                step="0.01" min="0" class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 bg-gray-50 rounded p-3">
                        Costo indirecto diario estimado (22 días hábiles):
                        <strong>${{ number_format($config->costo_indirecto_diario, 2) }} MXN/día</strong>
                    </p>
                </div>

                {{-- Umbral margen --}}
                <div class="bg-white shadow-sm sm:rounded-lg p-6 mb-4">
                    <h3 class="text-sm font-semibold text-gray-700 mb-4">Umbral de Rentabilidad</h3>
                    <div class="flex items-center gap-3">
                        <label class="text-sm text-gray-700">Margen mínimo aceptable:</label>
                        <input type="number" name="min_margin_pct" value="{{ old('min_margin_pct', $config->min_margin_pct) }}"
                            step="0.1" min="1" max="100" class="w-24 border-gray-300 rounded-md shadow-sm text-sm">
                        <span class="text-sm text-gray-500">%</span>
                    </div>
                    <p class="text-xs text-gray-400 mt-2">Si el margen de un producto baja de este valor, aparecerá en amarillo o rojo en el catálogo.</p>
                </div>

                <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700">
                    Guardar configuración
                </button>
            </form>

        </div>
    </div>
</x-app-layout>
