import { createClient } from './server'

export type UserRole = 'admin' | 'worker' | 'viewer' | 'client'

export async function getProfile(): Promise<{ taller_id: string; role: UserRole }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('taller_id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile?.taller_id) throw new Error('No taller found for user')
  return { taller_id: profile.taller_id, role: profile.role as UserRole }
}

export async function getTallerId(): Promise<string> {
  return (await getProfile()).taller_id
}

export async function requireAdmin(): Promise<string> {
  const { taller_id, role } = await getProfile()
  if (role !== 'admin') throw new Error('Forbidden: admin only')
  return taller_id
}

export async function requireWorkerOrAbove(): Promise<{ taller_id: string; role: UserRole }> {
  const profile = await getProfile()
  if (profile.role === 'viewer') throw new Error('Forbidden: read-only user')
  return profile
}
