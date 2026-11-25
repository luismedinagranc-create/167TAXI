import Link from 'next/link'
import { fmt, hm, eur } from '@/lib/dates'
const ST = { pending: ['Pendiente', 'pend'], done: ['Realizado', 'done'], cancelled: ['Cancelado', 'canc'] }
export default function ServiceCard({ s, showDate = true }) {
  const [label, cls] = ST[s.status]
  return (
    <Link href={`/servicio/${s.id}`} className="card row">
      <div>
        <b>{hm(s.service_time)}</b>{showDate && <> · {fmt(s.service_date)}</>}
        <div className="mu">
          {s.notes || 'Sin notas'}{s.photo_path ? ' · 📷' : ''}{s.billing === 'monthly' ? ` · Mensual ${eur(s.amount)}` : ''}
        </div>
      </div>
      <span className={`tag ${cls}`}>{label}</span>
    </Link>
  )
}
