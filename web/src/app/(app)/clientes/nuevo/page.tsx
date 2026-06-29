import { createCliente } from '../actions'
import Link from 'next/link'

const inputCls = 'w-full border border-warm bg-white text-bark text-sm px-3 py-2.5 focus:outline-none focus:border-terra transition-colors placeholder:text-dust'

export default function NuevoClientePage() {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clientes" className="text-dust hover:text-bark transition-colors">←</Link>
        <p className="text-xs font-medium text-dust uppercase tracking-widest">Nuevo Cliente</p>
      </div>

      <form action={createCliente} className="bg-white border border-warm p-5 space-y-5">
        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Nombre *</label>
          <input name="name" required maxLength={255} placeholder="Ej. Pink Up Store" className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Teléfono</label>
          <input name="phone" type="tel" maxLength={20} placeholder="33 1234 5678" className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Correo</label>
          <input name="email" type="email" maxLength={255} placeholder="contacto@cliente.com" className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Notas</label>
          <textarea name="notes" rows={2} placeholder="Dirección, referencias, etc." className={`${inputCls} resize-none`} />
        </div>

        <button type="submit" className="w-full bg-terra hover:bg-terra-dark text-white font-medium py-2.5 px-4 text-sm tracking-wide transition-colors">
          Crear Cliente
        </button>
      </form>
    </>
  )
}
