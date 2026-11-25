'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
export default function Reset() {
  const [pass, setPass] = useState(''); const [err, setErr] = useState('')
  async function guardar(e) {
    e.preventDefault()
    if (pass.length < 8) return setErr('Mínimo 8 caracteres.')
    const { error } = await supabaseBrowser().auth.updateUser({ password: pass })
    error ? setErr('No se pudo cambiar la contraseña.') : (window.location.href = '/')
  }
  return (
    <main className="wrap"><h1 className="logo">Nueva contraseña</h1>
      <form onSubmit={guardar}>
        <input type="password" placeholder="Nueva contraseña" value={pass} onChange={e => setPass(e.target.value)} autoComplete="new-password" />
        {err && <p className="err">{err}</p>}
        <button className="btn">Guardar contraseña</button>
      </form>
    </main>
  )
}
