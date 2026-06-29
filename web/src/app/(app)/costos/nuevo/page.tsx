import { createProducto } from '../actions'
import Link from 'next/link'

const inputCls = 'w-full border border-warm bg-white text-bark text-sm px-3 py-2.5 focus:outline-none focus:border-terra transition-colors placeholder:text-dust'

export default function NuevoProductoPage() {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/costos" className="text-dust hover:text-bark transition-colors">←</Link>
        <p className="text-xs font-medium text-dust uppercase tracking-widest">Nuevo Producto</p>
      </div>

      <form action={createProducto} className="bg-white border border-warm p-5 space-y-5">
        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Nombre del producto *</label>
          <input name="name" required maxLength={255} placeholder="Ej. Mueble Pink Up" className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Precio de venta ($MXN)</label>
            <input name="sale_price" type="number" min="0" step="0.01" defaultValue="0" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Costo estimado ($MXN)</label>
            <input name="estimated_cost" type="number" min="0" step="0.01" defaultValue="0" className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Notas</label>
          <textarea name="notes" rows={2} className={`${inputCls} resize-none`} />
        </div>

        <button type="submit" className="w-full bg-terra hover:bg-terra-dark text-white font-medium py-2.5 px-4 text-sm tracking-wide transition-colors">
          Crear Producto
        </button>
      </form>
    </>
  )
}
