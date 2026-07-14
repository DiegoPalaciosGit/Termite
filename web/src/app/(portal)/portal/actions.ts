'use server'
import { createClient } from '@/lib/supabase/server'
import { getTallerId } from '@/lib/supabase/taller'
import { redirect } from 'next/navigation'

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
