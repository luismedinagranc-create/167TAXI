'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import { monthStart, eur } from '@/lib/dates'

const F = [['production', 'Total producido (€)'], ['card', 'Cobrado con tarjeta (€)'], ['agency_manual', 'Servicios de agencia (€)'], ['fuel', 'Combustible (€)']]
export default function RecordForm({ date, rec }) {
  const sb = supabaseBrowser()
  const router = useRouter()
  const [v, setV] = useState(Object.fromEntries(F.map(([k]) => [k, rec ? String(rec[k]) : ''])))
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function save(e) {
    e.preventDefault(); setErr(''); setMsg('')
    const row = Object.fromEntries(F.map(([k]) => [k, Number(v[k] || 0)]))
    if (Object.values(row).some((x) => isNaN(x) || x < 0)) return setErr('Revisa los importes.')
    setBusy(true)
    const { error } = rec
      ? await sb.from('daily_records').update(row).eq('id', rec.id)
      : await sb.from('daily_records').insert({ work_date: date, ...row })
    setBusy(false)
    if (error) return setErr('No se pudo guardar el registro.')
    setMsg('Registro guardado.'); router.refresh()
  }
  async function remove() {
    if (!confirm('¿Borrar el registro de este día?')) return
    const { error } = await sb.from('daily_records').delete().eq('id', rec.id)
    if (error) return setErr('Solo se pueden borrar días de una semana abierta.')
    router.push('/economia'); router.refresh()
  }

  return (
    <form onSubmit={save} className="card">
      <label>Fecha</label>
      <input type="date" value={date} onChange={(e) => e.target.value && router.push(`/economia?f=${e.target.value}&m=${monthStart(e.target.value)}`)} />
      {F.map(([k, l]) => (
        <div key={k}>
          <label>{l}</label>
          <input type="number" inputMode="decimal" step="0.01" min="0" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
        </div>
      ))}
      {rec && Number(rec.agency_services) > 0 && (
        <p className="mu">+ {eur(rec.agency_services)} de servicios mensuales de este día (se suman solos a agencias).</p>
      )}
      <p className="mu">Los días de descanso no hace falta rellenarlos.</p>
      {err && <p className="err">{err}</p>}{msg && <p className="ok">{msg}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Guardando…' : 'Guardar registro'}</button>
      {rec && !rec.week_close_id && <button type="button" className="btn d" style={{ marginTop: 8 }} onClick={remove}>Borrar registro</button>}
    </form>
  )
}
