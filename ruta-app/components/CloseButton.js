'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function CloseButton({ kind, month }) {
  const sb = supabaseBrowser()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  async function go() {
    setBusy(true); setErr('')
    if (kind === 'week') {
      const { data, error } = await sb.rpc('close_week')
      if (error) { setBusy(false); return setErr(error.message) }
      router.replace(`/economia/resumen?k=week&id=${data}`)
    } else {
      const { error } = await sb.rpc('close_month', { p_month: month })
      if (error) { setBusy(false); return setErr(error.message) }
      router.replace(`/economia/resumen?k=month&m=${month}`)
    }
    router.refresh()
  }
  return (
    <div style={{ marginTop: 12 }}>
      {err && <p className="err">{err}</p>}
      <button className="btn" disabled={busy} onClick={go}>{busy ? 'Cerrando…' : 'Confirmar cierre y avisar al jefe'}</button>
      <p className="mu">Después podrás seguir modificando cualquier día; los totales se recalculan.</p>
    </div>
  )
}
