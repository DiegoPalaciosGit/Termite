<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800">Editar — {{ $material->name }}</h2>
    </x-slot>

    <div class="py-6">
        <div class="max-w-2xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white shadow-sm sm:rounded-lg p-6">
                <form method="POST" action="{{ route('materiales.update', $material) }}">
                    @csrf @method('PUT')

                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                            <input type="text" name="code" value="{{ old('code', $material->code) }}"
                                class="w-full border-gray-300 rounded-md shadow-sm text-sm" required>
                            @error('code') <p class="text-red-600 text-xs mt-1">{{ $message }}</p> @enderror
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                            <select name="category" class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                                <option value="A" {{ $material->category === 'A' ? 'selected' : '' }}>A — Alta rotación</option>
                                <option value="B" {{ $material->category === 'B' ? 'selected' : '' }}>B — Rotación media</option>
                                <option value="C" {{ $material->category === 'C' ? 'selected' : '' }}>C — Baja rotación</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input type="text" name="name" value="{{ old('name', $material->name) }}"
                            class="w-full border-gray-300 rounded-md shadow-sm text-sm" required>
                    </div>

                    <div class="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Unidad *</label>
                            <select name="unit" class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                                @foreach(['pza', 'tablero', 'lts', 'kg', 'caja', 'm2'] as $u)
                                    <option value="{{ $u }}" {{ $material->unit === $u ? 'selected' : '' }}>{{ $u }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Precio/u ($)</label>
                            <input type="number" name="cost_unit" value="{{ old('cost_unit', $material->cost_unit) }}" step="0.01" min="0"
                                class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
                            <input type="number" name="stock_min" value="{{ old('stock_min', $material->stock_min) }}" step="0.001" min="0"
                                class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                        </div>
                    </div>

                    <div class="flex gap-3">
                        <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700">Guardar</button>
                        <a href="{{ route('materiales.show', $material) }}" class="px-6 py-2 rounded-md border text-gray-700 hover:bg-gray-50">Cancelar</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</x-app-layout>
