'use client'
import { useState } from 'react'
export default function PhotoViewer({ url }) {
  const [open, setOpen] = useState(false)
  if (!url) return <div className="ph">Este servicio no tiene fotografía</div>
  return (
    <>
      <img src={url} alt="Fotografía del servicio" className="ph-img" onClick={() => setOpen(true)} />
      {open && (
        <div className="ov" onClick={() => setOpen(false)}>
          <img src={url} alt="Fotografía ampliada" />
          <button className="btn s sm ov-x" onClick={() => setOpen(false)}>Cerrar</button>
        </div>
      )}
    </>
  )
}
