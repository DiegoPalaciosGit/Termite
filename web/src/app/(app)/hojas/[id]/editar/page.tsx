import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateHoja } from '../../actions'

const inputCls = 'w-full border border-warm bg-white text-bark text-sm px-3 py-2.5 focus:outline-none focus:border-terra transition-colors placeholder:text-dust'

export default async function EditarHojaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: hoja }, { data: clientes }] = await Promise.all([
    supabase.from('hojas_viajeras').select('*').eq('id', id).single(),
    supabase.from('clients').select('id, name').order('name'),
  ])

  if (!hoja) notFound()

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/hojas/${id}`} className="text-dust hover:text-bark transition-colors">←</Link>
        <div>
          <p className="text-xs font-mono text-dust">{hoja.folio}</p>
          <p className="text-xs font-medium text-dust uppercase tracking-widest">Editar Orden</p>
        </div>
      </div>

      <form action={updateHoja} className="bg-white border border-warm p-5 space-y-5">
        <input type="hidden" name="id" value={id} />

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Producto *</label>
          <input name="product_name" required maxLength={255} defaultValue={hoja.product_name} className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Cliente</label>
          <select name="client_id" defaultValue={hoja.client_id ?? ''} className={inputCls}>
            <option value="">Sin cliente</option>
            {clientes?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Cantidad *</label>
          <input name="quantity" type="number" min="1" required defaultValue={hoja.quantity} className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Fecha estimada de entrega</label>
          <input name="estimated_end_date" type="date" defaultValue={hoja.estimated_end_date ?? ''} className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Notas</label>
          <textarea name="notes" rows={3} defaultValue={hoja.notes ?? ''} className={`${inputCls} resize-none`} />
        </div>

        <button type="submit" className="w-full bg-terra hover:bg-terra-dark text-white font-medium py-2.5 px-4 text-sm tracking-wide transition-colors">
          Guardar cambios
        </button>
      </form>
    </>
  )
}
