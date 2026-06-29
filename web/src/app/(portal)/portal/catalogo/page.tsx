import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CatalogoPage() {
  const supabase = await createClient()

  const { data: productos } = await supabase
    .from('products_catalog')
    .select('id, name, short_description, sale_price, estimated_delivery_days')
    .eq('is_active', true)
    .eq('is_visible_to_clients', true)
    .order('name')

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/portal" className="text-dust hover:text-bark transition-colors">←</Link>
        <div>
          <h1 className="text-lg font-semibold text-bark">Catálogo</h1>
          <p className="text-sm text-dust mt-0.5">Selecciona el mueble que necesitas</p>
        </div>
      </div>

      {(productos ?? []).length === 0 ? (
        <div className="text-center py-16 text-dust border border-dashed border-warm">
          <p className="text-sm">El catálogo está siendo preparado.</p>
          <p className="text-sm mt-1">Contáctanos directamente para cotizar.</p>
        </div>
      ) : (
        <div className="space-y-px">
          {(productos ?? []).map(p => (
            <Link
              key={p.id}
              href={`/portal/catalogo/${p.id}`}
              className="block bg-white border border-warm px-4 py-4 hover:bg-linen transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-bark">{p.name}</p>
                  {p.short_description && (
                    <p className="text-sm text-umber mt-1 leading-snug">{p.short_description}</p>
                  )}
                  {p.estimated_delivery_days && (
                    <p className="text-xs text-dust mt-1.5">
                      Entrega estimada: ~{p.estimated_delivery_days} días hábiles
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {Number(p.sale_price) > 0 ? (
                    <>
                      <p className="text-xs text-dust uppercase tracking-widest mb-0.5">Precio aprox.</p>
                      <p className="font-semibold text-bark">
                        ${Number(p.sale_price).toLocaleString('es-MX')}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-dust">Cotizar</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
