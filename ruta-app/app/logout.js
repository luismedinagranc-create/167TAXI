'use client'
import { supabaseBrowser } from '@/lib/supabase/client'
export default function Logout() {
  return <button className="link" onClick={async () => { await supabaseBrowser().auth.signOut(); window.location.href = '/login' }}>Cerrar sesión</button>
}
