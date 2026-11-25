import './globals.css'
export const metadata = {
  title: '67TAX',
  description: 'Agenda y cobros privados',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.png', apple: '/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: '67TAX', statusBarStyle: 'default' },
}
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#ffffff' }
export default function Root({ children }) {
  return <html lang="es"><body>{children}</body></html>
}
