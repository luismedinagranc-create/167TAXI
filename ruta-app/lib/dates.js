export const TZ = process.env.NEXT_PUBLIC_TZ || 'Atlantic/Canary'
export const MES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
const D = (s) => new Date(s + 'T12:00:00Z')
export const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: TZ })
export const add = (s, n) => { const d = D(s); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
export const dow = (s) => (D(s).getUTCDay() + 6) % 7 // lunes = 0
export const monday = (s) => add(s, -dow(s))
export const monthStart = (s) => s.slice(0, 8) + '01'
export const daysIn = (s) => new Date(Date.UTC(+s.slice(0, 4), +s.slice(5, 7), 0)).getUTCDate()
export const shiftMonth = (s, n) => { const d = D(monthStart(s)); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 10) }
export const fmt = (s) => D(s).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
export const hm = (t) => (t || '').slice(0, 5)
export const eur = (n) => Number(n).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
