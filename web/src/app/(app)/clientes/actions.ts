'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

export async function inviteCliente(formData: FormData) {
  const client_id = formData.get('client_id') as string
  const email = (formData.get('email') as string).trim()

  const taller_id = await requireAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { role: 'client' },
    redirectTo: 'https://mangle-termite.vercel.app/set-password',
  })

  if (error) {
    redirect(`/clientes/${client_id}?error=` + encodeURIComponent(error.message))
  }

  await admin.from('profiles').upsert({
    user_id: data.user.id,
    taller_id,
    role: 'client',
  }, { onConflict: 'user_id' })

  await admin.from('clients').update({ user_id: data.user.id }).eq('id', client_id)

  redirect(`/clientes/${client_id}?ok=invited`)
}
