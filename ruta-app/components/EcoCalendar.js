'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MES, add, dow, daysIn, shiftMonth } from '@/lib/dates'
import { sum } from '@/lib/econ'
import Totals from './Totals'

export default function EcoCalendar({ recs, month, t, role }) {
  const router = useRouter()
  const [sel, setSel] = useState([])
  const has = (d) => recs.some((r) => r.work_date === d)
  const cells = [...Array(dow(month)).fill(null), ...Array.from({ length: daysIn(month) }, (_, i) => add(month, i))]
  while (cells.length % 7) cells.push(null)
  const rows = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  const all = cells.filter(Boolean)

  function pick(list) {
    const a = list.filter((d) => d && has(d))
    if (!a.length) return
    const every = a.every((d) => sel.includes(d))
    setSel(every ? sel.filter((d) => !a.includes(d)) : [...new Set([...sel, ...a])])
  }
  function tap(d) { if (has(d)) pick([d]); else if (role === 'worker') router.push(`/economia?f=${d}&m=${month}`) }
  const chosen = recs.filter((r) => sel.includes(r.work_date))

  return (
    <>
      <div className="row" style={{ margin: '10px 0' }}>
        <Link className="btn s sm" href={`/economia?m=${shiftMonth(month, -1)}`}>‹</Link>
        <b style={{ textTransform: 'capitalize' }}>{MES[+month.slice(5, 7) - 1]} {month.slice(0, 4)}</b>
        <Link className="btn s sm" href={`/economia?m=${shiftMonth(month, 1)}`}>›</Link>
      </div>
      <div className="grid grid8">
        <div />
        {'LMXJVSD'.split('').map((x, i) => <div key={i} className="mu">{x}</div>)}
        {rows.map((row, r) => (
          <FragmentRow key={r} row={row} pick={pick} tap={tap} sel={sel} has={has} t={t} />
        ))}
      </div>
      <div className="row" style={{ margin: '10px 0' }}>
        <button className="btn s sm" onClick={() => pick(all)}>Todo el mes</button>
        <button className="btn s sm" onClick={() => setSel([])}>Limpiar</button>
      </div>
      {chosen.length > 0
        ? <Totals t={sum(chosen)} month={chosen.length === recs.length} title={`${chosen.length} días trabajados seleccionados`} />
        : <p className="mu">● = día trabajado. Toca días para sumar sus importes, o «Sem» para elegir una semana.{role === 'worker' ? ' Toca un día sin punto para registrarlo.' : ''}</p>}
    </>
  )
}

function FragmentRow({ row, pick, tap, sel, has, t }) {
  return (
    <>
      <button className="cell" style={{ aspectRatio: 'auto', fontSize: 11, color: 'var(--mu)' }} onClick={() => pick(row)}>Sem</button>
      {row.map((d, i) => d
        ? <button key={i} className={`cell ${d === t ? 't' : ''} ${sel.includes(d) ? 'sel' : ''}`} onClick={() => tap(d)}>
            {+d.slice(8)}{has(d) && <span className="dot" />}
          </button>
        : <div key={i} />)}
    </>
  )
}
