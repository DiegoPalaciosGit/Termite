'use server'
import { createAdminClient } from '@/lib/supabase/admin'
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
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { nombre },
    redirectTo: 'https://mangle-termite.vercel.app/set-password',
  })
  if (error) {
    redirect('/usuarios?error=' + encodeURIComponent(traducirError(error.message)))
  }
  redirect('/usuarios?ok=1')
}

export async function deleteUsuario(formData: FormData) {
  const userId = formData.get('user_id') as string
  const admin = createAdminClient()
  await admin.auth.admin.deleteUser(userId)
  revalidatePath('/usuarios')
}
