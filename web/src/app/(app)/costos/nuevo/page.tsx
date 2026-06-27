import { createProducto } from '../actions'
import Link from 'next/link'

export default function NuevoProductoPage() {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/costos" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Nuevo Producto</h2>
      </div>

      <form action={createProducto} className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto *</label>
          <input name="name" required maxLength={255} placeholder="Ej. Mueble Pink Up"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio de venta ($MXN)</label>
            <input name="sale_price" type="number" min="0" step="0.01" defaultValue="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Costo estimado ($MXN)</label>
            <input name="estimated_cost" type="number" min="0" step="0.01" defaultValue="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea name="notes" rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
        </div>

        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg transition-colors">
          Crear Producto
        </button>
      </form>
    </>
  )
}
