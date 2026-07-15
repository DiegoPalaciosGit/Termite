'use server'
import { createClient } from '@/lib/supabase/server'
import { getTallerId } from '@/lib/supabase/taller'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function getClienteId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: cliente } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()
  return cliente?.id ?? null
}

export async function crearSolicitud(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cliente } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const taller_id = await getTallerId()

  // folio lo asigna el trigger assign_folio (migración 007)
  await supabase.from('hojas_viajeras').insert({
    product_name: formData.get('product_name') as string,
    quantity: Number(formData.get('quantity')) || 1,
    client_id: cliente?.id ?? null,
    notes: (formData.get('notes') as string) || null,
    status: 'pendiente_aprobacion',
    taller_id,
  })

  redirect('/portal')
}

// ─── Notificaciones (RLS: el cliente solo puede borrar las suyas) ────────────

export async function deleteNotificacion(formData: FormData) {
  const supabase = await createClient()
  await supabase
    .from('client_notifications')
    .delete()
    .eq('id', formData.get('id') as string)
  revalidatePath('/portal/notificaciones')
}

export async function deleteNotificacionesPedido(formData: FormData) {
  const supabase = await createClient()
  await supabase
    .from('client_notifications')
    .delete()
    .eq('hoja_viajera_id', formData.get('hoja_id') as string)
  revalidatePath('/portal/notificaciones')
}

export async function deleteAllNotificaciones() {
  const supabase = await createClient()
  const clienteId = await getClienteId()
  if (!clienteId) return
  await supabase
    .from('client_notifications')
    .delete()
    .eq('client_id', clienteId)
  revalidatePath('/portal/notificaciones')
}

// ─── Feedback de compras ──────────────────────────────────────────────────────

export async function guardarFeedback(formData: FormData) {
  const supabase = await createClient()
  const clienteId = await getClienteId()
  if (!clienteId) redirect('/login')

  const rating = Number(formData.get('rating'))
  if (!rating || rating < 1 || rating > 5) return

  const taller_id = await getTallerId()

  await supabase.from('client_feedback').upsert({
    taller_id,
    client_id: clienteId,
    hoja_viajera_id: Number(formData.get('hoja_id')),
    rating,
    comment: (formData.get('comment') as string)?.trim() || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'hoja_viajera_id' })

  revalidatePath('/portal/compras')
}
