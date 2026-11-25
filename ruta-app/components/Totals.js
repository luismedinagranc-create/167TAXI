import { eur } from '@/lib/dates'
export default function Totals({ t, month = false, title }) {
  const rows = [['Producción total (100 %)', t.P], ['60 %', t.s60], ['40 %', t.s40], ['Efectivo', t.cash],
    ['Tarjeta', t.c], ['Agencias', t.g], ['Combustible', t.f]]
  if (!month) rows.push(['60 % neto (− combustible)', t.net60])
  return (
    <>
      {title && <div className="mu" style={{ marginTop: 12 }}>{title}</div>}
      <div className="card">
        {rows.map(([l, v]) => (
          <div key={l} className="row" style={{ padding: '6px 0' }}><span className="mu">{l}</span><b>{eur(v)}</b></div>
        ))}
      </div>
      {month && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="mu">TOTAL NETO DEL 60 %</div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-.02em' }}>{eur(t.net60)}</div>
          <div className="mu">(producción × 0,60) − combustible</div>
        </div>
      )}
    </>
  )
}
