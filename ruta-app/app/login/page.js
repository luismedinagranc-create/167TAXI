'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const sb = supabaseBrowser()

  async function entrar(e) {
    e.preventDefault(); setBusy(true); setErr(''); setMsg('')
    const { error } = await sb.auth.signInWithPassword({ email, password: pass })
    if (error) { setErr('Correo o contraseña incorrectos.'); setBusy(false); return }
    window.location.href = '/' // el middleware lleva a /admin o /worker según el rol
  }
  async function recuperar() {
    setErr(''); setMsg('')
    if (!email) return setErr('Escribe tu correo primero.')
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/callback?next=/reset` })
    error ? setErr('No se pudo enviar el correo.') : setMsg('Si el correo existe, recibirás un enlace para cambiar la contraseña.')
  }
  return (
    <main className="wrap">
      <img src="/logo.png" alt="67TAX" className="logo-img" />
      <p className="mu">Agenda y cobros privados</p>
      <form onSubmit={entrar}>
        <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" required />
        <input type="password" placeholder="Contraseña" value={pass} onChange={e => setPass(e.target.value)} autoComplete="current-password" required />
        {err && <p className="err">{err}</p>}{msg && <p className="ok">{msg}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Entrando…' : 'Iniciar sesión'}</button>
      </form>
      <button className="link" type="button" onClick={recuperar}>He olvidado mi contraseña</button>
    </main>
  )
}
