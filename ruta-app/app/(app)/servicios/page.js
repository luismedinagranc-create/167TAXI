import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import ServiceCard from '@/components/ServiceCard'

const TABS = [['pending', 'Pendientes'], ['done', 'Realizados'], ['cancelled', 'Cancelados']]
export default async function Servicios({ searchParams }) {
  const e = TABS.some(([k]) => k === searchParams?.e) ? searchParams.e : 'pending'
  const sb = await supabaseServer()
  const { data } = await sb.from('services').select('*').eq('status', e)
    .order('service_date', { ascending: e === 'pending' }).order('service_time').limit(100)
  return (
    <>
      <h1>Servicios</h1>
      <div className="seg">
        {TABS.map(([k, l]) => <Link key={k} href={`/servicios?e=${k}`} className={e === k ? 'on' : ''}>{l}</Link>)}
      </div>
      {(data ?? []).map((s) => <ServiceCard key={s.id} s={s} />)}
      {!data?.length && <p className="mu">No hay servicios en esta lista.</p>}
    </>
  )
}
