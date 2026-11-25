import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  let res = NextResponse.next({ request: req })
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value))
        res = NextResponse.next({ request: req })
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
      },
    },
  })
  const { data: { user } } = await sb.auth.getUser()
  const path = req.nextUrl.pathname
  const go = (to) => NextResponse.redirect(new URL(to, req.url))

  if (path.startsWith('/auth')) return res
  if (!user) return path === '/login' ? res : go('/login')
  if (path === '/reset') return res

  const { data: p } = await sb.from('profiles').select('role').eq('id', user.id).single()
  if (!p) return path === '/login' ? res : go('/login?error=sin-rol')
  if (path === '/' || path === '/login') return go('/inicio')
  if ((path.startsWith('/crear') || path.endsWith('/editar')) && p.role !== 'admin') return go('/inicio')
  return res
}
export const config = { matcher: ['/((?!_next|favicon.ico|.*\\..*).*)'] }
