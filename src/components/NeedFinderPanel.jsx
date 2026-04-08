import { useState, useEffect, useRef } from 'react'
import { mapJobToAreas } from '../lib/claude'
import { AREAS } from './Sidebar'

const GOAL_OPTIONS = [
  { value: 'job_current', label: 'Weiterbildung im aktuellen Job', icon: '💼' },
  { value: 'job_change',  label: 'Jobwechsel vorbereiten',        icon: '🚀' },
  { value: 'exam',        label: 'Prüfung / Zertifikat ablegen',  icon: '📋' },
  { value: 'general',     label: 'Allgemeinwissen aufbauen',      icon: '🌍' },
]

const LEVEL_OPTIONS = [
  { value: 'einsteiger',       label: 'Einsteiger',        icon: '🌱' },
  { value: 'fortgeschrittene', label: 'Fortgeschrittener', icon: '🌿' },
  { value: 'experte',          label: 'Experte',            icon: '🌳' },
]

export default function NeedFinderPanel({ preferences, onComplete, onStartAuth, context }) {
  const [editing, setEditing] = useState(!preferences)
  const [job, setJob] = useState(preferences?.job || '')
  const [jobAreas, setJobAreas] = useState(preferences?.jobAreas || [])
  const [goal, setGoal] = useState(preferences?.goal || '')
  const [level, setLevel] = useState(preferences?.level || '')
  const [mapping, setMapping] = useState(false)
  const debounceRef = useRef(null)

  // Debounced AI mapping when job input changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (job.trim().length < 2) { setJobAreas([]); return }
    setMapping(true)
    debounceRef.current = setTimeout(async () => {
      const areas = await mapJobToAreas(job)
      setJobAreas(areas)
      setMapping(false)
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [job])

  const canComplete = job.trim().length >= 2 && goal && level

  const handleComplete = () => {
    const prefs = { job: job.trim(), jobAreas, goal, level }
    localStorage.setItem('learnhub_preferences', JSON.stringify(prefs))
    onComplete(prefs)
    if (context === 'dashboard') setEditing(false)
  }

  const recommendedAreas = AREAS.filter(a => jobAreas.includes(a.id))

  // ── PROFILE SUMMARY (dashboard, not editing) ─────────────────────────
  if (context === 'dashboard' && !editing) {
    const goalLabel = GOAL_OPTIONS.find(o => o.value === preferences?.goal)
    const levelLabel = LEVEL_OPTIONS.find(o => o.value === preferences?.level)
    return (
      <aside style={panelStyle}>
        <div style={{ ...headerStyle, background: '#1D9E75' }}>
          <span style={{ fontSize: 14 }}>🎯</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Mein Profil</span>
          <button onClick={() => setEditing(true)} style={editBtnStyle}>✏️ Ändern</button>
        </div>

        <div style={{ padding: '14px', flex: 1, overflowY: 'auto' }}>
          <div style={{ background: '#F0FDF9', borderRadius: 10, padding: '12px', marginBottom: 14 }}>
            <div style={profileLabelStyle}>DEIN PROFIL</div>
            <div style={profileRowStyle}>💼 {preferences?.job || '—'}</div>
            {goalLabel && <div style={profileRowStyle}>{goalLabel.icon} {goalLabel.label}</div>}
            {levelLabel && <div style={profileRowStyle}>{levelLabel.icon} {levelLabel.label}</div>}
          </div>

          {recommendedAreas.length > 0 && (
            <>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 8 }}>Empfohlen für dich:</div>
              {recommendedAreas.map(a => (
                <div key={a.id} style={{ fontSize: 12, color: '#1D9E75', fontWeight: 600, marginBottom: 4 }}>
                  → {a.icon} {a.name}
                </div>
              ))}
            </>
          )}

          <button
            onClick={() => { setJob(''); setJobAreas([]); setGoal(''); setLevel(''); setEditing(true) }}
            style={{ marginTop: 14, width: '100%', background: 'none', border: 'none', color: '#9CA3AF', fontSize: 11, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
          >
            Profil neu erstellen
          </button>
        </div>
      </aside>
    )
  }

  // ── FLOW (landing page or editing in dashboard) ───────────────────────
  return (
    <aside style={panelStyle}>
      <div style={{ ...headerStyle, background: '#1D9E75' }}>
        <span style={{ fontSize: 14 }}>🎯</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Lernpfad-Finder</span>
        {context === 'dashboard' && (
          <button
            onClick={() => setEditing(false)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 11, cursor: 'pointer' }}
          >✕</button>
        )}
      </div>

      <div style={{ padding: '14px', flex: 1, overflowY: 'auto' }}>
        {/* Step 1: Beruf */}
        <div style={stepWrapStyle}>
          <div style={stepLabelStyle}>① Beruf</div>
          <input
            type="text"
            value={job}
            onChange={e => setJob(e.target.value)}
            placeholder="z.B. Softwareentwickler…"
            style={inputStyle}
          />
          {mapping && <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>Analysiere…</div>}
          {!mapping && jobAreas.length > 0 && (
            <div style={{ marginTop: 6 }}>
              {AREAS.filter(a => jobAreas.includes(a.id)).map(a => (
                <div key={a.id} style={{ fontSize: 10, color: '#1D9E75', fontWeight: 600 }}>→ {a.icon} {a.name}</div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Ziel */}
        <div style={stepWrapStyle}>
          <div style={stepLabelStyle}>② Ziel</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {GOAL_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setGoal(o.value)} style={optionStyle(goal === o.value)}>
                <span>{o.icon}</span>
                <span style={{ fontSize: 10, fontWeight: goal === o.value ? 600 : 400, color: goal === o.value ? '#065F46' : '#374151' }}>{o.label}</span>
                {goal === o.value && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Niveau */}
        <div style={stepWrapStyle}>
          <div style={stepLabelStyle}>③ Niveau</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {LEVEL_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setLevel(o.value)} style={optionStyle(level === o.value)}>
                <span>{o.icon}</span>
                <span style={{ fontSize: 10, fontWeight: level === o.value ? 600 : 400, color: level === o.value ? '#065F46' : '#374151' }}>{o.label}</span>
                {level === o.value && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Live recommendation */}
        {jobAreas.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #F0FDF9, #fff)', border: '1.5px solid #1D9E75', borderRadius: 10, padding: '10px', marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: '#1D9E75', fontWeight: 700, marginBottom: 6 }}>⭐ EMPFOHLEN</div>
            {AREAS.filter(a => jobAreas.includes(a.id)).map(a => (
              <div key={a.id} style={{ fontSize: 11, color: '#065F46', fontWeight: 600 }}>{a.icon} {a.name}</div>
            ))}
            {(goal || level) && <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 4 }}>Aktualisiert live</div>}
          </div>
        )}

        {/* CTA */}
        {context === 'landing' ? (
          <button
            onClick={() => { if (canComplete) handleComplete(); onStartAuth() }}
            style={{ ...ctaBtnStyle, opacity: 1 }}
          >
            Jetzt starten →
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={!canComplete}
            style={{ ...ctaBtnStyle, opacity: canComplete ? 1 : 0.45, cursor: canComplete ? 'pointer' : 'not-allowed' }}
          >
            Speichern →
          </button>
        )}
      </div>
    </aside>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────
const panelStyle = {
  width: 280,
  minWidth: 280,
  background: '#fff',
  borderLeft: '3px solid #1D9E75',
  display: 'flex',
  flexDirection: 'column',
  position: 'sticky',
  top: 0,
  height: '100vh',
  overflowY: 'auto',
  boxShadow: '-4px 0 16px rgba(0,0,0,0.06)',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

const headerStyle = {
  padding: '12px 14px',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexShrink: 0,
}

const stepWrapStyle = { marginBottom: 14 }

const stepLabelStyle = { fontSize: 10, color: '#9CA3AF', marginBottom: 5, fontWeight: 500 }

const inputStyle = {
  width: '100%',
  padding: '7px 10px',
  border: '1.5px solid #E5E7EB',
  borderRadius: 8,
  fontSize: 11,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const optionStyle = (selected) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 8px',
  border: `1.5px solid ${selected ? '#1D9E75' : '#E5E7EB'}`,
  borderRadius: 7,
  background: selected ? '#F0FDF9' : '#fff',
  cursor: 'pointer',
  textAlign: 'left',
  fontSize: 11,
  fontFamily: 'inherit',
  width: '100%',
})

const ctaBtnStyle = {
  width: '100%',
  padding: '10px',
  background: '#1D9E75',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  marginTop: 4,
  fontFamily: 'inherit',
}

const editBtnStyle = {
  marginLeft: 'auto',
  background: 'rgba(255,255,255,0.15)',
  border: 'none',
  borderRadius: 6,
  padding: '2px 8px',
  fontSize: 10,
  color: '#fff',
  cursor: 'pointer',
}

const profileLabelStyle = { fontSize: 9, color: '#065F46', fontWeight: 700, marginBottom: 6, letterSpacing: '.05em' }
const profileRowStyle = { fontSize: 11, color: '#374151', marginBottom: 3 }
