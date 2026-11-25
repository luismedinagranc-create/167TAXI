import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { getMe } from '@/lib/profile'
import { today, add, daysIn, monthStart, fmt, eur, MES, TZ } from '@/lib/dates'
import { sum } from '@/lib/econ'
import Totals from '@/components/Totals'
import RecordForm from '@/components/RecordForm'
import EcoCalendar from '@/components/EcoCalendar'

const OK = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s ?? '')
const FIELD = { production: 'Producido', card: 'Tarjeta', agency_manual: 'Agencias', fuel: 'Combustible' }

function Block({ title, days, worker, href }) {
  return (
    <>
      <h2>{title}</h2>
      <div className="card">
        {days.map((d, i) => {
          const inner = (
            <>
              <b>Día {i + 1} · {fmt(d.work_date)}</b>
              <div className="mu">Producido {eur(d.production)} · Tarjeta {eur(d.card)} · Agencias {eur(d.agency)} · Combustible {eur(d.fuel)}</div>
              <div className="mu">Efectivo {eur(d.cash)}{Number(d.agency_services) > 0 ? ` · incluye ${eur(d.agency_services)} de servicios mensuales` : ''}</div>
            </>
          )
          return worker
            ? <Link key={d.id} className="day" href={`/economia?f=${d.work_date}&m=${monthStart(d.work_date)}`}>{inner}</Link>
            : <div key={d.id} className="day">{inner}</div>
        })}
      </div>
      <Totals t={sum(days)} title="Totales de la semana" />
      <Link className="btn s sm" href={href}>Ver resumen</Link>
    </>
  )
}

export default async function Economia({ searchParams }) {
  const me = await getMe()
  const worker = me.role === 'worker'
  const t = today()
  const f = OK(searchParams?.f) ? searchParams.f : t
  const m = OK(searchParams?.m) ? monthStart(searchParams.m) : monthStart(t)
  const sb = await supabaseServer()
  const last = add(m, daysIn(m) - 1)

  const [recQ, monthQ, openQ, closesQ, mcQ, chQ, profQ] = await Promise.all([
    sb.from('daily_totals').select('*').eq('work_date', f).maybeSingle(),
    sb.from('daily_totals').select('*').gte('work_date', m).lte('work_date', last).order('work_date'),
    sb.from('daily_totals').select('*').is('week_close_id', null).order('work_date'),
    sb.from('week_closes').select('id, week_no').order('closed_at', { ascending: false }).limit(8),
    sb.from('month_closes').select('id').eq('month', m).maybeSingle(),
    sb.from('record_changes').select('*').order('changed_at', { ascending: false }).limit(30),
    sb.from('profiles').select('id, name'),
  ])
  const closes = closesQ.data ?? []
  const closedDays = closes.length
    ? (await sb.from('daily_totals').select('*').in('week_close_id', closes.map((c) => c.id)).order('work_date')).data ?? []
    : []
  const open = openQ.data ?? []
  const names = Object.fromEntries((profQ.data ?? []).map((p) => [p.id, p.name]))
  const mName = MES[+m.slice(5, 7) - 1]

  return (
    <>
      <h1>{worker ? 'Mi registro económico' : 'Resumen económico del trabajador'}</h1>
      {worker
        ? <RecordForm key={f} date={f} rec={recQ.data} />
        : <p className="mu">Solo consulta: no puedes modificar los registros del trabajador.</p>}

      {worker && (
        <div className="row" style={{ margin: '12px 0' }}>
          {open.length
            ? <Link className="btn s" style={{ flex: 1, textAlign: 'center' }} href="/economia/resumen?k=week&id=open&confirm=1">Cerrar semana</Link>
            : <span className="btn s" style={{ flex: 1, textAlign: 'center', opacity: 0.5 }}>Cerrar semana</span>}
          {mcQ.data
            ? <Link className="btn s" style={{ flex: 1, textAlign: 'center' }} href={`/economia/resumen?k=month&m=${m}`}>Mes de {mName} cerrado</Link>
            : <Link className="btn s" style={{ flex: 1, textAlign: 'center' }} href={`/economia/resumen?k=month&m=${m}&confirm=1`}>Cerrar mes ({mName})</Link>}
        </div>
      )}

      <h2>Calendario</h2>
      <EcoCalendar key={m} recs={monthQ.data ?? []} month={m} t={t} role={me.role} />

      {open.length > 0 && <Block title={`Semana ${(closes[0]?.week_no ?? 0) + 1} · en curso`} days={open} worker={worker} href="/economia/resumen?k=week&id=open" />}
      {closes.map((c) => (
        <Block key={c.id} title={`Semana ${c.week_no}`} days={closedDays.filter((d) => d.week_close_id === c.id)} worker={worker} href={`/economia/resumen?k=week&id=${c.id}`} />
      ))}
      {!open.length && !closes.length && <p className="mu">Aún no hay registros.</p>}

      <h2>Historial de cambios</h2>
      {(chQ.data ?? []).map((c) => (
        <div key={c.id} className="card">
          <b>{fmt(c.work_date)} · {FIELD[c.field]}</b>
          <div className="mu">{eur(c.old_value)} → {eur(c.new_value)}</div>
          <div className="mu">{names[c.changed_by] ?? 'Trabajador'} · {new Date(c.changed_at).toLocaleString('es-ES', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' })}</div>
        </div>
      ))}
      {!chQ.data?.length && <p className="mu">Sin modificaciones.</p>}
    </>
  )
}
