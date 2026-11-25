'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import { resizeImage } from '@/lib/image'
import { today } from '@/lib/dates'

export default function ServiceForm({ service, photoUrl }) {
  const sb = supabaseBrowser()
  const router = useRouter()
  const [date, setDate] = useState(service?.service_date ?? today())
  const [time, setTime] = useState(service?.service_time?.slice(0, 5) ?? '09:00')
  const [notes, setNotes] = useState(service?.notes ?? '')
  const [billing, setBilling] = useState(service?.billing ?? 'client')
  const [amount, setAmount] = useState(service?.amount ?? '')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(photoUrl ?? null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function save(e) {
    e.preventDefault(); setErr('')
    if (billing === 'monthly' && !(Number(amount) > 0)) return setErr('Pon el importe del servicio mensual.')
    setBusy(true)
    let photo_path = service?.photo_path ?? null
    if (file) {
      const blob = await resizeImage(file)
      const path = `${crypto.randomUUID()}.jpg`
      const { error } = await sb.storage.from('service-photos').upload(path, blob, { contentType: 'image/jpeg' })
      if (error) { setErr('No se pudo subir la foto.'); setBusy(false); return }
      if (photo_path) await sb.storage.from('service-photos').remove([photo_path])
      photo_path = path
    }
    const row = {
      service_date: date, service_time: time, notes: notes || null, photo_path,
      billing, amount: billing === 'monthly' ? Number(amount) : null,
    }
    const { error } = service
      ? await sb.from('services').update(row).eq('id', service.id)
      : await sb.from('services').insert(row)
    if (error) { setErr('No se pudo guardar el servicio.'); setBusy(false); return }
    router.push(service ? `/servicio/${service.id}` : '/calendario')
    router.refresh()
  }

  return (
    <form onSubmit={save}>
      <label>Fecha</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      <label>Hora</label>
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
      <label>Fotografía</label>
      <input type="file" accept="image/*" onChange={(e) => {
        const f = e.target.files[0]; if (!f) return
        setFile(f); setPreview(URL.createObjectURL(f))
      }} />
      {preview && <img src={preview} alt="Vista previa" className="ph-img" style={{ cursor: 'default' }} />}
      <label>Información adicional (opcional)</label>
      <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      <label>¿Cómo se cobra?</label>
      <select value={billing} onChange={(e) => setBilling(e.target.value)}>
        <option value="client">Se cobra al cliente (sin importe)</option>
        <option value="monthly">Se cobra mensual (agencia)</option>
      </select>
      {billing === 'monthly' && (
        <>
          <label>Importe del servicio (€)</label>
          <input type="number" inputMode="decimal" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <p className="mu">Se suma solo a «Servicios de agencia» del día elegido.</p>
        </>
      )}
      {err && <p className="err">{err}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Guardando…' : service ? 'Guardar cambios' : 'Guardar y enviar'}</button>
    </form>
  )
}
