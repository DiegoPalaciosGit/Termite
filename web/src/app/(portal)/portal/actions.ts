'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function crearSolicitud(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Buscar el registro de cliente vinculado al usuario
  const { data: cliente } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('hojas_viajeras')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`)

  const folio = `HV-${year}-${String((count ?? 0) + 1).padStart(3, '0')}`

  await supabase.from('hojas_viajeras').insert({
    folio,
    product_name: formData.get('product_name') as string,
    quantity: Number(formData.get('quantity')) || 1,
    client_id: cliente?.id ?? null,
    notes: (formData.get('notes') as string) || null,
    status: 'pendiente_aprobacion',
  })

  redirect('/portal')
}
