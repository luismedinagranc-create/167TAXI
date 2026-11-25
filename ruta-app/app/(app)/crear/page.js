import { redirect } from 'next/navigation'
import { getMe } from '@/lib/profile'
import ServiceForm from '@/components/ServiceForm'
export default async function Crear() {
  const me = await getMe()
  if (me.role !== 'admin') redirect('/inicio')
  return (<><h1>Crear servicio</h1><ServiceForm /></>)
}
