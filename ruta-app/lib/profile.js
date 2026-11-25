import { cache } from 'react'
import { supabaseServer } from '@/lib/supabase/server'
export const getMe = cache(async () => {
  const sb = await supabaseServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null
  const { data: p } = await sb.from('profiles').select('name, role').eq('id', user.id).single()
  return p ? { ...p, id: user.id, email: user.email } : null
})
