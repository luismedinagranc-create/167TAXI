import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import ServiceCard from '@/components/ServiceCard'
import { today, add, dow, monday, monthStart, daysIn, shiftMonth, fmt, MES } from '@/lib/dates'

const OK = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s ?? '')
export default async function Calendario({ searchParams }) {
  const t = today()
  const v = ['m', 'w', 'd'].includes(searchParams?.v) ? searchParams.v : 'm'
  const d = OK(searchParams?.d) ? searchParams.d : t
  const sel = OK(searchParams?.s) ? searchParams.s : d
  const first = v === 'm' ? add(monthStart(d), -7) : v === 'w' ? monday(d) : d
  const last = v === 'm' ? add(monthStart(d), 38) : v === 'w' ? add(monday(d), 6) : d
  const sb = await supabaseServer()
  const { data } = await sb.from('services').select('*').neq('status', 'cancelled')
    .gte('service_date', first).lte('service_date', last).order('service_time')
  const list = data ?? []
  const by = (day) => list.filter((s) => s.service_date === day)
  const href = (o) => '/calendario?' + new URLSearchParams({ v, d, s: sel, ...o }).toString()
  const [prev, next] = v === 'm' ? [shiftMonth(d, -1), shiftMonth(d, 1)] : v === 'w' ? [add(d, -7), add(d, 7)] : [add(d, -1), add(d, 1)]
  const title = v === 'm' ? `${MES[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}` : v === 'w' ? `${fmt(monday(d))} – ${fmt(add(monday(d), 6))}` : fmt(d)
  const start = monthStart(d)
  const cells = [...Array(dow(start)).fill(null), ...Array.from({ length: daysIn(d) }, (_, i) => add(start, i))]

  return (
    <>
      <h1>Calendario</h1>
      <div className="seg">
        {[['d', 'Día'], ['w', 'Semana'], ['m', 'Mes']].map(([k, l]) => (
          <Link key={k} href={`/calendario?v=${k}&d=${d}&s=${sel}`} className={v === k ? 'on' : ''}>{l}</Link>
        ))}
      </div>
      <div className="row" style={{ margin: '10px 0' }}>
        <Link className="btn s sm" href={href({ d: prev, s: prev })}>‹</Link>
        <b style={{ textTransform: 'capitalize' }}>{title}</b>
        <Link className="btn s sm" href={href({ d: t, s: t })}>Hoy</Link>
        <Link className="btn s sm" href={href({ d: next, s: next })}>›</Link>
      </div>

      {v === 'm' && (
        <>
          <div className="grid">
            {'LMXJVSD'.split('').map((x, i) => <div key={i} className="mu">{x}</div>)}
            {cells.map((day, i) => day
              ? <Link key={i} href={href({ s: day })} className={`cell ${day === t ? 't' : ''} ${day === sel ? 'sel' : ''}`}>
                  {+day.slice(8)}{by(day).length > 0 && <span className="dot" />}
                </Link>
              : <div key={i} />)}
          </div>
          <h2>{fmt(sel)}</h2>
          {by(sel).map((s) => <ServiceCard key={s.id} s={s} showDate={false} />)}
          {!by(sel).length && <p className="mu">Sin servicios este día.</p>}
        </>
      )}
      {v === 'w' && Array.from({ length: 7 }, (_, i) => add(monday(d), i)).map((day) => (
        <div key={day}>
          <h2>{fmt(day)}</h2>
          {by(day).map((s) => <ServiceCard key={s.id} s={s} showDate={false} />)}
          {!by(day).length && <p className="mu">Libre</p>}
        </div>
      ))}
      {v === 'd' && (
        <>
          {by(d).map((s) => <ServiceCard key={s.id} s={s} showDate={false} />)}
          {!by(d).length && <p className="mu">Sin servicios este día.</p>}
        </>
      )}
    </>
  )
}
