import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

// Marca el aviso como leído y lleva directamente al resumen o servicio correspondiente
export async function GET(req, { params }) {
  const sb = await supabaseServer()
  const { data: n } = await sb.from('notifications').select('ref_kind, ref_id').eq('id', params.id).maybeSingle()
  if (n) await sb.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', params.id)
  const to = {
    week: `/economia/resumen?k=week&id=${n?.ref_id}`,
    month: `/economia/resumen?k=month&m=${n?.ref_id}`,
    service: `/servicio/${n?.ref_id}`,
  }[n?.ref_kind] ?? '/avisos'
  return NextResponse.redirect(new URL(to, req.url))
}
