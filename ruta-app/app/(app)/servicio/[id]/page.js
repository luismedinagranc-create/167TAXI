import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { getMe } from '@/lib/profile'
import { fmt, hm, eur, TZ } from '@/lib/dates'
import PhotoViewer from '@/components/PhotoViewer'
import Actions from '@/components/Actions'

export default async function Detalle({ params }) {
  const me = await getMe()
  const sb = await supabaseServer()
  const { data: s } = await sb.from('services').select('*').eq('id', params.id).maybeSingle()
  if (!s) notFound()
  let url = null
  if (s.photo_path) {
    const { data } = await sb.storage.from('service-photos').createSignedUrl(s.photo_path, 3600)
    url = data?.signedUrl ?? null
  }
  const st = { pending: 'Pendiente', done: 'Realizado', cancelled: 'Cancelado' }[s.status]
  return (
    <>
      <h1>{hm(s.service_time)} · {fmt(s.service_date)}</h1>
      <p className="mu">Estado: {st}{s.done_at ? ` · finalizado el ${new Date(s.done_at).toLocaleString('es-ES', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' })}` : ''}</p>
      <PhotoViewer url={url} />
      <p>{s.notes || 'Sin información adicional'}</p>
      <p className="mu">{s.billing === 'monthly' ? `Se cobra mensual · ${eur(s.amount)} (se suma a agencias del día)` : 'Se cobra al cliente'}</p>
      <Actions role={me.role} s={s} />
    </>
  )
}
