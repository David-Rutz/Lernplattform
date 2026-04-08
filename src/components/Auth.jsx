import { useState } from 'react'
import { supabase } from '../lib/supabase'

const s = {
  wrap: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px', background: 'linear-gradient(135deg, #064E3B 0%, #1D9E75 100%)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20,
    padding: '40px 36px', width: '100%', maxWidth: 400,
    boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoIcon: {
    width: 38, height: 38, background: 'rgba(255,255,255,0.2)', borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 18, fontWeight: 700, border: '1px solid rgba(255,255,255,0.3)',
  },
  logoName: { fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 6, color: '#fff' },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 28 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: 'rgba(255,255,255,0.85)' },
  input: {
    width: '100%', padding: '11px 14px',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, fontSize: 14,
    outline: 'none', marginBottom: 16, boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.15)', color: '#fff',
    fontFamily: 'inherit',
  },
  btn: {
    width: '100%', padding: '12px', background: '#fff', color: '#064E3B',
    border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
    cursor: 'pointer', transition: 'opacity .15s', fontFamily: 'inherit',
  },
  toggle: { textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  toggleLink: { color: '#A7F3D0', cursor: 'pointer', fontWeight: 600 },
  error: {
    background: 'rgba(254,226,226,0.15)', color: '#FCA5A5',
    border: '1px solid rgba(252,165,165,0.3)',
    padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16,
  },
  success: {
    background: 'rgba(209,250,229,0.15)', color: '#A7F3D0',
    border: '1px solid rgba(167,243,208,0.3)',
    padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16,
  },
}

export default function Auth({ onBack }) {
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
      {onBack && (
        <button onClick={onBack} style={{ position: 'fixed', top: 20, left: 24, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: '8px 16px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(4px)' }}>
          ← Zur Startseite
        </button>
      )}
      <style>{`
        input::placeholder { color: rgba(255,255,255,0.45); }
        input { caret-color: #fff; }
        @media (max-width: 480px) {
          .auth-card { padding: 32px 24px !important; }
        }
      `}</style>
      <div style={s.card} className="auth-card">
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
