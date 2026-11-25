import { supabaseServer } from '@/lib/supabase/server'
import { getMe } from '@/lib/profile'
import { today } from '@/lib/dates'
import ServiceCard from '@/components/ServiceCard'

export default async function Inicio() {
  const me = await getMe()
  const sb = await supabaseServer()
  const t = today()
  const { data: next } = await sb.from('services').select('*').eq('status', 'pending').gte('service_date', t)
    .order('service_date').order('service_time').limit(10)
  const { data: late } = await sb.from('services').select('*').eq('status', 'pending').lt('service_date', t)
    .order('service_date', { ascending: false }).limit(10)
  return (
    <>
      <h1>Hola, {me.name}</h1>
      <h2>Próximos servicios</h2>
      {(next ?? []).map((s) => <ServiceCard key={s.id} s={s} />)}
      {!next?.length && <p className="mu">No hay servicios pendientes.</p>}
      {late?.length > 0 && (
        <>
          <h2>{me.role === 'worker' ? 'Pendientes de marcar' : 'Pasados sin marcar como realizados'}</h2>
          {late.map((s) => <ServiceCard key={s.id} s={s} />)}
        </>
      )}
    </>
  )
}
