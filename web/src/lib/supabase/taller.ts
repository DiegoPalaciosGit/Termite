import { createClient } from './server'

export async function getTallerId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('taller_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.taller_id) throw new Error('No taller found for user')
  return profile.taller_id
}
