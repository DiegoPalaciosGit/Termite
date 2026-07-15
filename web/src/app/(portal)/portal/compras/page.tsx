import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FeedbackForm from './FeedbackForm'

type Compra = {
  id: number
  folio: string
  product_name: string
  quantity: number
  actual_end_date: string | null
}

type Feedback = {
  hoja_viajera_id: number
  rating: number
  comment: string | null
}

export default async function ComprasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cliente } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const [{ data: hojas }, { data: feedbacks }] = await Promise.all([
    supabase
      .from('hojas_viajeras')
      .select('id, folio, product_name, quantity, actual_end_date')
      .eq('client_id', cliente?.id ?? '')
      .eq('status', 'terminado')
      .order('actual_end_date', { ascending: false }),
    supabase
      .from('client_feedback')
      .select('hoja_viajera_id, rating, comment'),
  ])

  const compras = (hojas ?? []) as Compra[]
  const feedbackMap = new Map(
    ((feedbacks ?? []) as Feedback[]).map(f => [f.hoja_viajera_id, f])
  )

  return (
    <>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-bark">Mis compras</h1>
        <p className="text-sm text-dust mt-0.5">
          {compras.length === 0
            ? 'Aún no tienes pedidos entregados'
            : `${compras.length} pedido${compras.length !== 1 ? 's' : ''} entregado${compras.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {compras.length === 0 ? (
        <div className="bg-white border border-warm p-8 text-center">
          <p className="text-sm text-dust">
            Cuando un pedido se termine aparecerá aquí, y podrás contarnos qué te pareció.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {compras.map(compra => {
            const fb = feedbackMap.get(compra.id)
            return (
              <div key={compra.id} className="bg-white border border-warm p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono text-dust shrink-0">{compra.folio}</span>
                    <span className="text-sm font-medium text-bark truncate">
                      {compra.product_name} ×{compra.quantity}
                    </span>
                  </div>
                  {compra.actual_end_date && (
                    <span className="text-xs text-dust shrink-0">
                      {new Date(compra.actual_end_date + 'T00:00:00').toLocaleDateString('es-MX', { dateStyle: 'medium' })}
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-warm">
                  <p className="text-xs font-medium text-dust uppercase tracking-widest mb-3">
                    {fb ? 'Tu opinión (puedes editarla)' : '¿Qué te pareció?'}
                  </p>
                  <FeedbackForm
                    hojaId={compra.id}
                    initialRating={fb?.rating ?? 0}
                    initialComment={fb?.comment ?? ''}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
