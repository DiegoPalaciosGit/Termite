'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getTallerId } from '@/lib/supabase/taller'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const ERROR_MAP: Record<string, string> = {
  'already been registered': 'Este correo ya está registrado',
  'already registered':      'Este correo ya está registrado',
  'Invalid email':           'Correo inválido',
  'rate limit':              'Demasiados intentos, espera un momento',
}

function traducirError(msg: string): string {
  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return val
  }
  return msg
}

export async function inviteUsuario(formData: FormData) {
  const email = (formData.get('email') as string).trim()
  const nombre = (formData.get('nombre') as string).trim()
  const role = (formData.get('role') as string) || 'worker'

  const taller_id = await getTallerId()
  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { nombre, role },
    redirectTo: 'https://mangle-termite.vercel.app/set-password',
  })
  if (error) {
    redirect('/usuarios?error=' + encodeURIComponent(traducirError(error.message)))
  }

  await admin.from('profiles').upsert({
    user_id: data.user.id,
    taller_id,
    role,
  }, { onConflict: 'user_id' })

  redirect('/usuarios?ok=1')
}

export async function deleteUsuario(formData: FormData) {
  const userId = formData.get('user_id') as string
  const admin = createAdminClient()
  await admin.auth.admin.deleteUser(userId)
  revalidatePath('/usuarios')
}
