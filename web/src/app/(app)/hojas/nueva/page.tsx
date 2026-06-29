import { createClient } from '@/lib/supabase/server'
import { createHoja } from '../actions'
import Link from 'next/link'

const inputCls = 'w-full border border-warm bg-white text-bark text-sm px-3 py-2.5 focus:outline-none focus:border-terra transition-colors placeholder:text-dust'

export default async function NuevaHojaPage() {
  const supabase = await createClient()
  const { data: clientes } = await supabase.from('clients').select('id, name').order('name')

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/hojas" className="text-dust hover:text-bark transition-colors">←</Link>
        <p className="text-xs text-dust uppercase tracking-widest font-medium">Nueva Orden de Trabajo</p>
      </div>

      <form action={createHoja} className="bg-white border border-warm p-5 space-y-5">
        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Producto *</label>
          <input name="product_name" required maxLength={255} placeholder="Ej. Mueble Pink Up" className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Cliente</label>
          <select name="client_id" className={inputCls}>
            <option value="">Sin cliente</option>
            {clientes?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Cantidad *</label>
          <input name="quantity" type="number" min="1" defaultValue="1" required className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Fecha estimada de entrega</label>
          <input name="estimated_end_date" type="date" className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Notas</label>
          <textarea name="notes" rows={3} placeholder="Observaciones, especificaciones, etc." className={`${inputCls} resize-none`} />
        </div>

        <button type="submit" className="w-full bg-terra hover:bg-terra-dark text-white font-medium py-2.5 px-4 text-sm tracking-wide transition-colors">
          Crear Orden
        </button>
      </form>
    </>
  )
}
