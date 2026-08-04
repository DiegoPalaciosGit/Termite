<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800">Editar — {{ $catalogo->name }}</h2>
    </x-slot>

    <div class="py-6">
        <div class="max-w-2xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white shadow-sm sm:rounded-lg p-6">
                <form method="POST" action="{{ route('catalogo.update', $catalogo) }}">
                    @csrf @method('PUT')
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input type="text" name="name" value="{{ old('name', $catalogo->name) }}"
                            class="w-full border-gray-300 rounded-md shadow-sm text-sm" required>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Precio de venta ($) *</label>
                            <input type="number" name="sale_price" value="{{ old('sale_price', $catalogo->sale_price) }}" step="0.01" min="0"
                                class="w-full border-gray-300 rounded-md shadow-sm text-sm" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Costo estimado ($)</label>
                            <input type="number" name="estimated_cost" value="{{ old('estimated_cost', $catalogo->estimated_cost) }}" step="0.01" min="0"
                                class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                        </div>
                    </div>
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                        <textarea name="notes" rows="2" class="w-full border-gray-300 rounded-md shadow-sm text-sm">{{ old('notes', $catalogo->notes) }}</textarea>
                    </div>
                    <div class="flex gap-3">
                        <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700">Guardar</button>
                        <a href="{{ route('catalogo.index') }}" class="px-6 py-2 rounded-md border text-gray-700 hover:bg-gray-50">Cancelar</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</x-app-layout>
