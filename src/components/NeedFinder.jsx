import { useState } from 'react'

const STEPS = [
  {
    question: 'Was ist dein Lernziel?',
    key: 'goal',
    options: [
      { value: 'job_current', label: 'Weiterbildung im aktuellen Job', icon: '💼' },
      { value: 'job_change',  label: 'Jobwechsel vorbereiten',        icon: '🚀' },
      { value: 'refresh',    label: 'Wissen auffrischen',             icon: '🔄' },
      { value: 'exam',       label: 'Prüfungsvorbereitung',           icon: '📝' },
    ],
  },
  {
    question: 'Wie viel Zeit hast du pro Woche?',
    key: 'time',
    options: [
      { value: '30min', label: '30 Minuten',  icon: '⚡' },
      { value: '1h',    label: '1 Stunde',    icon: '🕐' },
      { value: '2h',    label: '2 Stunden',   icon: '🕑' },
      { value: '3h',    label: '3+ Stunden',  icon: '🏋️' },
    ],
  },
  {
    question: 'Auf welchem Level bist du?',
    key: 'level',
    options: [
      { value: 'einsteiger',      label: 'Einsteiger',      icon: '🌱', desc: 'Kein Vorwissen nötig' },
      { value: 'fortgeschrittene',label: 'Fortgeschrittene',icon: '🌿', desc: 'Grundwissen vorhanden' },
      { value: 'experte',         label: 'Experte',         icon: '🌳', desc: 'Tiefes Verständnis' },
    ],
  },
]

export default function NeedFinder({ onDone }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})

  const handleSelect = (value) => {
    const key = STEPS[step].key
    const newAnswers = { ...answers, [key]: value }
    setAnswers(newAnswers)
    if (step + 1 >= STEPS.length) {
      localStorage.setItem('learnhub_preferences', JSON.stringify(newAnswers))
      localStorage.setItem('learnhub_onboarding_done', '1')
      onDone(newAnswers)
    } else {
      setStep(s => s + 1)
    }
  }

  const current = STEPS[step]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16
    }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', maxWidth: 460, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i <= step ? '#1D9E75' : '#E5E7EB', transition: 'all .3s' }} />
          ))}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em', textAlign: 'center' }}>{current.question}</h2>
        <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>Schritt {step + 1} von {STEPS.length}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {current.options.map(opt => (
            <button key={opt.value} onClick={() => handleSelect(opt.value)} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
              border: '2px solid #E5E7EB', borderRadius: 12, cursor: 'pointer',
              background: '#fff', textAlign: 'left', fontFamily: 'inherit',
              transition: 'border-color .15s, background .15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1D9E75'; e.currentTarget.style.background = '#F0FDF9' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#fff' }}
            >
              <span style={{ fontSize: 22 }}>{opt.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{opt.label}</div>
                {opt.desc && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{opt.desc}</div>}
              </div>
            </button>
          ))}
        </div>

        <button onClick={() => { localStorage.setItem('learnhub_onboarding_done', '1'); onDone(null) }}
          style={{ marginTop: 20, width: '100%', background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', padding: 8 }}>
          Überspringen
        </button>
      </div>
    </div>
  )
}
