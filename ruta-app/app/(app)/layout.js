import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getMe } from '@/lib/profile'
import { supabaseServer } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import Live from '@/components/Live'
import Logout from '../logout'

export default async function AppLayout({ children }) {
  const me = await getMe()
  if (!me) redirect('/login')
  const sb = await supabaseServer()
  const { count } = await sb.from('notifications').select('id', { count: 'exact', head: true }).is('read_at', null)
  return (
    <div className="app">
      <header className="hdr">
        <img src="/logo.png" alt="67TAX" className="hdr-logo" />
        <div className="hdr-r">
          <Link href="/avisos" className="btn s sm">Avisos{count ? ` (${count})` : ''}</Link>
          <div><b>{me.name}</b><div className="mu" style={{ fontSize: 12 }}>{me.role === 'admin' ? 'Administrador' : 'Trabajador'}</div></div>
          <Logout />
        </div>
      </header>
      <main>{children}</main>
      <Nav role={me.role} />
      <Live />
    </div>
  )
}
