'use server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/taller'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCliente(formData: FormData) {
  const supabase = await createClient()
  const taller_id = await requireAdmin()
  await supabase.from('clients').insert({
    name:  (formData.get('name') as string).trim(),
    phone: (formData.get('phone') as string).trim() || null,
    email: (formData.get('email') as string).trim() || null,
    notes: (formData.get('notes') as string).trim() || null,
    taller_id,
  })
  revalidatePath('/clientes')
  redirect('/clientes')
}

export async function updateCliente(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('clients').update({
    name:  (formData.get('name') as string).trim(),
    phone: (formData.get('phone') as string).trim() || null,
    email: (formData.get('email') as string).trim() || null,
    notes: (formData.get('notes') as string).trim() || null,
  }).eq('id', id)
  revalidatePath('/clientes')
  redirect(`/clientes/${id}`)
}
