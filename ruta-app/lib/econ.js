export const R = (x) => Math.round(x * 100) / 100
// Mismas fórmulas que la base de datos: 60 % y 40 % sobre la producción; efectivo = producción − tarjeta − agencias − combustible
export function sum(a) {
  const q = (k) => R(a.reduce((s, x) => s + Number(x[k] || 0), 0))
  const P = q('production'), c = q('card'), g = q('agency'), f = q('fuel')
  return { days: a.length, P, c, g, f, s60: R(P * 0.6), s40: R(P * 0.4), cash: R(P - c - g - f), net60: R(P * 0.6 - f) }
}
// Convierte la fila de la función econ_summary de la base de datos
export const fromDb = (r) => ({ days: r.days, P: Number(r.production), s60: Number(r.share60), s40: Number(r.share40),
  cash: Number(r.cash), c: Number(r.card), g: Number(r.agency), f: Number(r.fuel), net60: Number(r.net60) })
