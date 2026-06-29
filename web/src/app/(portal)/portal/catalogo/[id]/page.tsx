import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { crearSolicitud } from '../../actions'

const inputCls = 'w-full border border-warm bg-white text-bark text-sm px-3 py-2.5 focus:outline-none focus:border-terra transition-colors placeholder:text-dust'

export default async function ProductoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: producto } = await supabase
    .from('products_catalog')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .eq('is_visible_to_clients', true)
    .single()

  if (!producto) notFound()

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/portal/catalogo" className="text-dust hover:text-bark transition-colors">←</Link>
        <p className="text-xs font-medium text-dust uppercase tracking-widest">Catálogo</p>
      </div>

      {/* Encabezado del producto */}
      <div className="bg-white border border-warm p-5 mb-4">
        <h1 className="text-lg font-semibold text-bark mb-1">{producto.name}</h1>
        {producto.short_description && (
          <p className="text-sm text-umber mb-3">{producto.short_description}</p>
        )}
        <div className="flex items-center gap-6 pt-3 border-t border-warm">
          {Number(producto.sale_price) > 0 && (
            <div>
              <p className="text-xs text-dust uppercase tracking-widest mb-0.5">Precio aprox.</p>
              <p className="text-xl font-bold text-bark">
                ${Number(producto.sale_price).toLocaleString('es-MX')}
              </p>
            </div>
          )}
          {producto.estimated_delivery_days && (
            <div>
              <p className="text-xs text-dust uppercase tracking-widest mb-0.5">Entrega estimada</p>
              <p className="text-sm font-semibold text-bark">{producto.estimated_delivery_days} días hábiles</p>
            </div>
          )}
        </div>
      </div>

      {/* Descripción detallada */}
      {producto.detailed_description && (
        <div className="bg-white border border-warm p-5 mb-4">
          <p className="text-xs font-medium text-dust uppercase tracking-widest mb-3">Descripción del producto</p>
          <div className="text-sm text-bark leading-relaxed whitespace-pre-wrap">
            {producto.detailed_description}
          </div>
        </div>
      )}

      {/* Formulario de solicitud */}
      <div className="bg-white border border-warm p-5">
        <p className="text-xs font-medium text-dust uppercase tracking-widest mb-4">Solicitar cotización</p>
        <form action={crearSolicitud} className="space-y-4">
          <input type="hidden" name="product_name" value={producto.name} />

          <div>
            <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">
              Cantidad *
            </label>
            <input
              name="quantity"
              type="number"
              min="1"
              defaultValue="1"
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">
              Notas o especificaciones
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Dimensiones específicas, colores, materiales, fecha deseada de entrega…"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="pt-2 border-t border-warm">
            <p className="text-xs text-dust mb-3">
              Tu solicitud quedará como <strong>Pendiente de aprobación</strong>. Carlos revisará
              los detalles, pactará la fecha y precio final contigo antes de iniciar producción.
            </p>
            <button
              type="submit"
              className="w-full bg-terra hover:bg-terra-dark text-white font-medium py-2.5 px-4 text-sm tracking-wide transition-colors"
            >
              Enviar solicitud
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
