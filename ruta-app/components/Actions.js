'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function Actions({ role, s }) {
  const sb = supabaseBrowser()
  const router = useRouter()
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function setStatus(status) {
    setBusy(true); setErr('')
    const { error } = await sb.from('services').update({ status }).eq('id', s.id)
    setBusy(false)
    if (error) return setErr('No se pudo actualizar el servicio.')
    router.refresh()
  }
  async function remove() {
    if (!confirm('¿Eliminar este servicio? Si era mensual, su importe se resta de las agencias de ese día.')) return
    setBusy(true); setErr('')
    const { error } = await sb.from('services').delete().eq('id', s.id)
    if (error) { setBusy(false); return setErr('No se pudo eliminar el servicio.') }
    if (s.photo_path) await sb.storage.from('service-photos').remove([s.photo_path])
    router.push('/calendario'); router.refresh()
  }

  return (
    <div style={{ marginTop: 16 }}>
      {err && <p className="err">{err}</p>}
      {role === 'worker' && s.status === 'pending' && (
        <button className="btn" disabled={busy} onClick={() => setStatus('done')}>Marcar como realizado</button>
      )}
      {role === 'admin' && (
        <>
          <Link href={`/servicio/${s.id}/editar`} className="btn s" style={{ display: 'block', textAlign: 'center' }}>Modificar servicio</Link>
          {s.status === 'pending' && <button className="btn s" style={{ marginTop: 8 }} disabled={busy} onClick={() => { if (confirm('¿Cancelar este servicio?')) setStatus('cancelled') }}>Cancelar servicio</button>}
          <button className="btn d" style={{ marginTop: 8 }} disabled={busy} onClick={remove}>Eliminar servicio</button>
        </>
      )}
    </div>
  )
}
