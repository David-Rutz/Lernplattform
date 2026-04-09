import { useState, useEffect, useRef, Fragment } from 'react'
import { mapJobToAreas } from '../lib/claude'
import { AREAS, AreaChip } from './Sidebar'

const GOAL_OPTIONS = [
  { value: 'job_current', label: 'Weiterbildung im aktuellen Job' },
  { value: 'job_change',  label: 'Jobwechsel vorbereiten' },
  { value: 'exam',        label: 'Prüfung / Zertifikat ablegen' },
  { value: 'general',     label: 'Allgemeinwissen aufbauen' },
]

const LEVEL_OPTIONS = [
  { value: 'einsteiger',       label: 'Einsteiger',        color: '#059669' },
  { value: 'fortgeschrittene', label: 'Fortgeschrittener', color: '#d97706' },
  { value: 'experte',          label: 'Experte',           color: '#6366f1' },
]

const CrosshairIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
    <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

function StepIndicator({ jobDone, goalDone }) {
  // currentStep: 1 if job not done, 2 if job done but goal not, 3 otherwise
  const currentStep = !jobDone ? 1 : !goalDone ? 2 : 3
  const steps = ['Beruf', 'Ziel', 'Niveau']
  const stepDone = [jobDone, goalDone, false] // level done is end state

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
      {steps.map((label, i) => {
        const num = i + 1
        const done = stepDone[i]
        const active = num === currentStep
        return (
          <Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: done || active ? '#059669' : 'rgba(255,255,255,0.06)',
                border: active ? '2px solid #34D399' : '2px solid transparent',
                boxShadow: active ? '0 0 0 3px rgba(5,150,105,0.2)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .2s',
              }}>
                {done ? (
                  <span style={{ color: '#fff' }}><CheckIcon /></span>
                ) : (
                  <span style={{ color: active ? '#fff' : '#4B5563', fontSize: 10, fontWeight: 800 }}>{num}</span>
                )}
              </div>
              <span style={{ fontSize: 8, fontWeight: 600, color: active ? '#34D399' : done ? '#6EE7B7' : '#4B5563', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: stepDone[i] ? '#059669' : 'rgba(255,255,255,0.1)', margin: '0 4px', marginBottom: 14, transition: 'background .2s' }} />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

export default function NeedFinderPanel({ preferences, onComplete, onStartAuth, onClose, context }) {
  const [editing, setEditing] = useState(!preferences)
  const [job, setJob] = useState(preferences?.job || '')
  const [jobAreas, setJobAreas] = useState(preferences?.jobAreas || [])
  const [goal, setGoal] = useState(preferences?.goal || '')
  const [level, setLevel] = useState(preferences?.level || '')
  const [mapping, setMapping] = useState(false)
  const debounceRef = useRef(null)

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
  const goalLabel = GOAL_OPTIONS.find(o => o.value === preferences?.goal)
  const levelOption = LEVEL_OPTIONS.find(o => o.value === preferences?.level)

  // ── PROFILE SUMMARY (dashboard, not editing) ─────────────────────────
  if (context === 'dashboard' && !editing) {
    return (
      <aside style={panelStyle}>
        <div style={{ ...headerStyle, background: '#1D9E75' }}>
          <CrosshairIcon />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Mein Profil</span>
          <button onClick={() => setEditing(true)} style={editBtnStyle}>Ändern</button>
          {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginLeft: 4, padding: 0 }}>✕</button>}
        </div>

        <div style={{ padding: '14px', flex: 1, overflowY: 'auto' }}>
          <div style={{ background: '#F0FDF9', borderRadius: 10, padding: '12px', marginBottom: 14 }}>
            <div style={profileLabelStyle}>DEIN PROFIL</div>
            <div style={profileRowStyle}>{preferences?.job || '—'}</div>
            {goalLabel && <div style={profileRowStyle}>{goalLabel.label}</div>}
            {levelOption && (
              <div style={{ ...profileRowStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: levelOption.color, flexShrink: 0 }} />
                {levelOption.label}
              </div>
            )}
          </div>

          {recommendedAreas.length > 0 && (
            <>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 8 }}>Empfohlen für dich:</div>
              {recommendedAreas.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#1D9E75', fontWeight: 600, marginBottom: 6 }}>
                  <AreaChip area={a} active={false} />
                  {a.name}
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

  // ── FLOW ─────────────────────────────────────────────────────────────
  return (
    <aside style={panelStyle}>
      <div style={{ ...headerStyle, background: '#1D9E75' }}>
        <CrosshairIcon />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Lernpfad-Finder</span>
        {context === 'dashboard' && (
          <button
            onClick={() => onClose ? onClose() : setEditing(false)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer' }}
          >✕</button>
        )}
      </div>

      <div style={{ padding: '14px', flex: 1, overflowY: 'auto' }}>
        <StepIndicator jobDone={job.trim().length >= 2} goalDone={!!goal} />

        {/* Step 1: Beruf */}
        <div style={stepWrapStyle}>
          <div style={stepLabelStyle}>Dein Beruf</div>
          <input
            type="text"
            value={job}
            onChange={e => setJob(e.target.value)}
            placeholder="z.B. Softwareentwickler…"
            style={inputStyle}
          />
          {mapping && <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>Analysiere…</div>}
          {!mapping && jobAreas.length > 0 && (
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {AREAS.filter(a => jobAreas.includes(a.id)).map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#1D9E75', fontWeight: 600 }}>
                  <AreaChip area={a} active={false} />
                  {a.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Ziel */}
        <div style={stepWrapStyle}>
          <div style={stepLabelStyle}>Dein Ziel</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {GOAL_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setGoal(o.value)} style={optionStyle(goal === o.value)}>
                <span style={{ fontSize: 10, fontWeight: goal === o.value ? 600 : 400, color: goal === o.value ? '#065F46' : '#374151', flex: 1, textAlign: 'left' }}>{o.label}</span>
                {goal === o.value && <span style={{ color: '#059669' }}><CheckIcon /></span>}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Niveau */}
        <div style={stepWrapStyle}>
          <div style={stepLabelStyle}>Dein Niveau</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {LEVEL_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setLevel(o.value)} style={optionStyle(level === o.value)}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: o.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: level === o.value ? 600 : 400, color: level === o.value ? '#065F46' : '#374151', flex: 1, textAlign: 'left' }}>{o.label}</span>
                {level === o.value && <span style={{ color: '#059669' }}><CheckIcon /></span>}
              </button>
            ))}
          </div>
        </div>

        {/* Live recommendation */}
        {jobAreas.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #F0FDF9, #fff)', border: '1.5px solid #1D9E75', borderRadius: 10, padding: '10px', marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: '#1D9E75', fontWeight: 700, marginBottom: 6, letterSpacing: '.06em', textTransform: 'uppercase' }}>Empfohlen</div>
            {AREAS.filter(a => jobAreas.includes(a.id)).map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#065F46', fontWeight: 600, marginBottom: 4 }}>
                <AreaChip area={a} active={false} />
                {a.name}
              </div>
            ))}
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
  width: 280, minWidth: 280, background: '#fff',
  borderLeft: '3px solid #1D9E75', display: 'flex', flexDirection: 'column',
  position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
  boxShadow: '-4px 0 16px rgba(0,0,0,0.06)', fontFamily: 'system-ui, -apple-system, sans-serif',
}
const headerStyle = { padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }
const stepWrapStyle = { marginBottom: 14 }
const stepLabelStyle = { fontSize: 10, color: '#9CA3AF', marginBottom: 5, fontWeight: 500 }
const inputStyle = {
  width: '100%', padding: '7px 10px', border: '1.5px solid #E5E7EB',
  borderRadius: 8, fontSize: 11, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}
const optionStyle = (selected) => ({
  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px',
  border: `1.5px solid ${selected ? '#1D9E75' : '#E5E7EB'}`, borderRadius: 7,
  background: selected ? '#F0FDF9' : '#fff', cursor: 'pointer',
  fontSize: 11, fontFamily: 'inherit', width: '100%',
})
const ctaBtnStyle = {
  width: '100%', padding: '10px', background: '#1D9E75', color: '#fff',
  border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700,
  cursor: 'pointer', marginTop: 4, fontFamily: 'inherit',
}
const editBtnStyle = {
  marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', border: 'none',
  borderRadius: 6, padding: '2px 8px', fontSize: 10, color: '#fff', cursor: 'pointer',
}
const profileLabelStyle = { fontSize: 9, color: '#065F46', fontWeight: 700, marginBottom: 6, letterSpacing: '.05em' }
const profileRowStyle = { fontSize: 11, color: '#374151', marginBottom: 3 }
