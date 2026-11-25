import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { getMe } from '@/lib/profile'
import { today, add, daysIn, monthStart, fmt, eur, MES } from '@/lib/dates'
import { fromDb } from '@/lib/econ'
import Totals from '@/components/Totals'
import CloseButton from '@/components/CloseButton'

const UUID = /^[0-9a-f-]{36}$/i
export default async function Resumen({ searchParams }) {
  const me = await getMe()
  const sb = await supabaseServer()
  const kind = searchParams?.k === 'month' ? 'month' : 'week'
  const confirm = searchParams?.confirm === '1' && me.role === 'worker'
  let id = null, m = null, title, rpcArgs, daysQ

  if (kind === 'week') {
    id = UUID.test(searchParams?.id ?? '') ? searchParams.id : null
    rpcArgs = { p_week: id, p_month: null }
    daysQ = sb.from('daily_totals').select('*').order('work_date')
    daysQ = id ? daysQ.eq('week_close_id', id) : daysQ.is('week_close_id', null)
    if (id) {
      const { data: w } = await sb.from('week_closes').select('week_no').eq('id', id).maybeSingle()
      if (!w) notFound()
      title = `Resumen semanal · Semana ${w.week_no}`
      if (me.role === 'admin') await sb.rpc('mark_seen', { p_kind: 'week', p_ref: id })
    } else title = 'Resumen semanal · semana en curso'
  } else {
    m = /^\d{4}-\d{2}-\d{2}$/.test(searchParams?.m ?? '') ? monthStart(searchParams.m) : monthStart(today())
    rpcArgs = { p_week: null, p_month: m }
    daysQ = sb.from('daily_totals').select('*').gte('work_date', m).lte('work_date', add(m, daysIn(m) - 1)).order('work_date')
    title = `Resumen mensual · ${MES[+m.slice(5, 7) - 1]} ${m.slice(0, 4)}`
    if (me.role === 'admin') await sb.rpc('mark_seen', { p_kind: 'month', p_ref: m })
  }

  const { data } = await sb.rpc('econ_summary', rpcArgs)
  const row = Array.isArray(data) ? data[0] : data
  const { data: days } = await daysQ
  const t = fromDb(row)

  return (
    <>
      <h1>{title}</h1>
      <p className="mu">{t.days} días trabajados{confirm ? ' · revisa los importes antes de cerrar' : ''}</p>
      <Totals t={t} month={kind === 'month'} />
      <h2>Días</h2>
      <div className="card">
        {(days ?? []).map((d) => (
          <div key={d.id} className="day">
            <b>{fmt(d.work_date)}</b>
            <div className="mu">Producido {eur(d.production)} · Tarjeta {eur(d.card)} · Agencias {eur(d.agency)} · Combustible {eur(d.fuel)}</div>
          </div>
        ))}
        {!days?.length && <p className="mu">Sin días registrados.</p>}
      </div>
      {confirm && <CloseButton kind={kind} month={m} />}
    </>
  )
}
