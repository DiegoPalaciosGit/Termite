import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateCliente } from '../../actions'

const inputCls = 'w-full border border-warm bg-white text-bark text-sm px-3 py-2.5 focus:outline-none focus:border-terra transition-colors placeholder:text-dust'

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: cliente } = await supabase.from('clients').select('*').eq('id', id).single()
  if (!cliente) notFound()

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/clientes/${id}`} className="text-dust hover:text-bark transition-colors">←</Link>
        <p className="text-xs font-medium text-dust uppercase tracking-widest">Editar Cliente</p>
      </div>

      <form action={updateCliente} className="bg-white border border-warm p-5 space-y-5">
        <input type="hidden" name="id" value={id} />

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Nombre *</label>
          <input name="name" required maxLength={255} defaultValue={cliente.name} className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Teléfono</label>
          <input name="phone" type="tel" maxLength={20} defaultValue={cliente.phone ?? ''} className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Correo</label>
          <input name="email" type="email" maxLength={255} defaultValue={cliente.email ?? ''} className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Notas</label>
          <textarea name="notes" rows={2} defaultValue={cliente.notes ?? ''} className={`${inputCls} resize-none`} />
        </div>

        <button type="submit" className="w-full bg-terra hover:bg-terra-dark text-white font-medium py-2.5 px-4 text-sm tracking-wide transition-colors">
          Guardar cambios
        </button>
      </form>
    </>
  )
}
