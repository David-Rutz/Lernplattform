import { useState } from 'react'
import { supabase } from '../lib/supabase'

const s = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(135deg, #f0fdf9 0%, #f8f9fa 60%)' },
  card: { background: '#fff', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoIcon: { width: 38, height: 38, background: '#1D9E75', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 600 },
  logoName: { fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' },
  title: { fontSize: 22, fontWeight: 600, marginBottom: 6 },
  sub: { fontSize: 14, color: '#6B7280', marginBottom: 28 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: '#374151' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid rgba(0,0,0,0.14)', borderRadius: 8, fontSize: 14, outline: 'none', transition: 'border-color .15s', marginBottom: 16 },
  btn: { width: '100%', padding: '11px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'background .15s' },
  toggle: { textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6B7280' },
  toggleLink: { color: '#1D9E75', cursor: 'pointer', fontWeight: 500 },
  error: { background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
  success: { background: '#E1F5EE', color: '#085041', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
}

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const handle = async (e) => {
    e.preventDefault()
    setError(''); setMsg(''); setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
        if (error) throw error
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password: pw, options: { data: { full_name: name } } })
        if (error) throw error
        setMsg('Bestätigungs-E-Mail gesendet! Bitte prüfe dein Postfach.')
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) throw error
        setMsg('Passwort-Reset-E-Mail gesendet!')
      }
    } catch (err) {
      setError(err.message || 'Ein Fehler ist aufgetreten.')
    }
    setLoading(false)
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoIcon}>L</div>
          <span style={s.logoName}>LearnHub</span>
        </div>
        <h1 style={s.title}>{mode === 'login' ? 'Willkommen zurück' : mode === 'register' ? 'Konto erstellen' : 'Passwort zurücksetzen'}</h1>
        <p style={s.sub}>{mode === 'login' ? 'Melde dich an und lerne weiter.' : mode === 'register' ? 'Starte kostenlos mit deiner Weiterbildung.' : 'Wir senden dir einen Link.'}</p>
        {error && <div style={s.error}>{error}</div>}
        {msg && <div style={s.success}>{msg}</div>}
        <form onSubmit={handle}>
          {mode === 'register' && (
            <div><label style={s.label}>Name</label><input style={s.input} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Max Muster" required /></div>
          )}
          <div><label style={s.label}>E-Mail</label><input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="max@beispiel.ch" required /></div>
          {mode !== 'reset' && (
            <div><label style={s.label}>Passwort</label><input style={s.input} type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" required minLength={6} /></div>
          )}
          <button style={s.btn} type="submit" disabled={loading}>{loading ? 'Bitte warten...' : mode === 'login' ? 'Anmelden' : mode === 'register' ? 'Registrieren' : 'Link senden'}</button>
        </form>
        <div style={s.toggle}>
          {mode === 'login' ? (<>Noch kein Konto? <span style={s.toggleLink} onClick={() => setMode('register')}>Registrieren</span> · <span style={s.toggleLink} onClick={() => setMode('reset')}>Passwort vergessen</span></>) :
           (<>Bereits registriert? <span style={s.toggleLink} onClick={() => setMode('login')}>Anmelden</span></>)}
        </div>
      </div>
    </div>
  )
}
