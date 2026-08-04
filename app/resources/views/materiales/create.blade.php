<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800">Nuevo Material</h2>
    </x-slot>

    <div class="py-6">
        <div class="max-w-2xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white shadow-sm sm:rounded-lg p-6">
                <form method="POST" action="{{ route('materiales.store') }}">
                    @csrf
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                            <input type="text" name="code" value="{{ old('code') }}" placeholder="ej. MDF-15MM-MAPLE"
                                class="w-full border-gray-300 rounded-md shadow-sm text-sm" required>
                            @error('code') <p class="text-red-600 text-xs mt-1">{{ $message }}</p> @enderror
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                            <select name="category" class="w-full border-gray-300 rounded-md shadow-sm text-sm" required>
                                <option value="A" {{ old('category') === 'A' ? 'selected' : '' }}>A — Alta rotación</option>
                                <option value="B" {{ old('category') === 'B' ? 'selected' : '' }}>B — Rotación media</option>
                                <option value="C" {{ old('category') === 'C' ? 'selected' : '' }}>C — Baja rotación</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input type="text" name="name" value="{{ old('name') }}"
                            class="w-full border-gray-300 rounded-md shadow-sm text-sm" required>
                        @error('name') <p class="text-red-600 text-xs mt-1">{{ $message }}</p> @enderror
                    </div>

                    <div class="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Unidad *</label>
                            <select name="unit" class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                                <option value="pza">pza</option>
                                <option value="tablero">tablero</option>
                                <option value="lts">lts</option>
                                <option value="kg">kg</option>
                                <option value="caja">caja</option>
                                <option value="m2">m2</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Precio/u ($)</label>
                            <input type="number" name="cost_unit" value="{{ old('cost_unit', 0) }}" step="0.01" min="0"
                                class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Stock inicial</label>
                            <input type="number" name="stock_current" value="{{ old('stock_current', 0) }}" step="0.001" min="0"
                                class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                        </div>
                    </div>

                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Stock mínimo (alerta)</label>
                        <input type="number" name="stock_min" value="{{ old('stock_min', 0) }}" step="0.001" min="0"
                            class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                    </div>

                    <div class="flex gap-3">
                        <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700">Crear material</button>
                        <a href="{{ route('materiales.index') }}" class="px-6 py-2 rounded-md border text-gray-700 hover:bg-gray-50">Cancelar</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</x-app-layout>
