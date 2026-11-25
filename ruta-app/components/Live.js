'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
// Cualquier cambio en la base de datos refresca la pantalla sin recargar
const TABLES = ['services', 'notifications', 'daily_records', 'week_closes', 'month_closes']
export default function Live() {
  const router = useRouter()
  useEffect(() => {
    const sb = supabaseBrowser()
    let ch = sb.channel('live')
    TABLES.forEach((table) => { ch = ch.on('postgres_changes', { event: '*', schema: 'public', table }, () => router.refresh()) })
    ch.subscribe()
    return () => { sb.removeChannel(ch) }
  }, [router])
  return null
}
