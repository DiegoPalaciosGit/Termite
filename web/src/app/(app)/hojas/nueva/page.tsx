import { createClient } from '@/lib/supabase/server'
import { createHoja } from '../actions'
import Link from 'next/link'

export default async function NuevaHojaPage() {
  const supabase = await createClient()
  const { data: clientes } = await supabase.from('clients').select('id, name').order('name')

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/hojas" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Nueva Hoja Viajera</h2>
      </div>

      <form action={createHoja} className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
          <input
            name="product_name"
            required
            maxLength={255}
            placeholder="Ej. Mueble Pink Up"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <select
            name="client_id"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Sin cliente</option>
            {clientes?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
          <input
            name="quantity"
            type="number"
            min="1"
            defaultValue="1"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha estimada de entrega</label>
          <input
            name="estimated_end_date"
            type="date"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Observaciones, especificaciones, etc."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          Crear Hoja Viajera
        </button>
      </form>
    </>
  )
}
