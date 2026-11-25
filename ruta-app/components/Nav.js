'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
const IC = {
  '/inicio': 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  '/calendario': 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4',
  '/servicios': 'M4 6h16M4 12h16M4 18h16',
  '/crear': 'M12 5v14M5 12h14',
  '/economia': 'M3 7h18v12H3zM3 11h18M7 15h3',
}
export default function Nav({ role }) {
  const path = usePathname()
  const items = [['/inicio', 'Inicio'], ['/calendario', 'Calendario'], ['/servicios', 'Servicios']]
  if (role === 'admin') items.push(['/crear', 'Crear'])
  items.push(['/economia', role === 'admin' ? 'Economía' : 'Registro'])
  return (
    <nav className="bar"><div>
      {items.map(([href, label]) => (
        <Link key={href} href={href} className={path.startsWith(href) ? 'on' : ''}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={IC[href]} /></svg>
          {label}
        </Link>
      ))}
    </div></nav>
  )
}
