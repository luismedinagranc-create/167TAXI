import { notFound, redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { getMe } from '@/lib/profile'
import ServiceForm from '@/components/ServiceForm'

export default async function Editar({ params }) {
  const me = await getMe()
  if (me.role !== 'admin') redirect('/inicio')
  const sb = await supabaseServer()
  const { data: s } = await sb.from('services').select('*').eq('id', params.id).maybeSingle()
  if (!s) notFound()
  let url = null
  if (s.photo_path) {
    const { data } = await sb.storage.from('service-photos').createSignedUrl(s.photo_path, 3600)
    url = data?.signedUrl ?? null
  }
  return (<><h1>Modificar servicio</h1><ServiceForm service={s} photoUrl={url} /></>)
}
