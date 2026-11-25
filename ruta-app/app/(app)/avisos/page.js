import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { TZ } from '@/lib/dates'

export default async function Avisos() {
  const sb = await supabaseServer()
  const { data } = await sb.from('notifications').select('*').order('created_at', { ascending: false }).limit(50)
  return (
    <>
      <h1>Avisos</h1>
      {(data ?? []).map((n) => (
        <Link key={n.id} href={`/avisos/abrir/${n.id}`} className="card" style={{ display: 'block' }}>
          <div className="row"><b>{n.read_at ? '' : '● '}{n.title}</b>
            <span className="mu" style={{ fontSize: 12 }}>{new Date(n.created_at).toLocaleString('es-ES', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' })}</span></div>
          <div className="mu">{n.body}</div>
        </Link>
      ))}
      {!data?.length && <p className="mu">No tienes avisos.</p>}
    </>
  )
}
