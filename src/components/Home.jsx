import { AREAS } from './Sidebar'

const GOAL_AREAS = {
  job_current: ['ict', 'management', 'hr'],
  job_change:  ['ict', 'marketing', 'hr'],
  refresh:     ['finanzen', 'vwl', 'recht'],
  exam:        ['finanzen', 'recht', 'vwl'],
}

function AreaCard({ area, done, onClick, size = 'md' }) {
  const isLg = size === 'lg'
  return (
    <button onClick={onClick} style={{
      position: 'relative', borderRadius: 14, overflow: 'hidden',
      aspectRatio: '3/4', cursor: 'pointer', border: 'none', padding: 0,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)', transition: 'transform .15s, box-shadow .15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.22)' }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)' }}
    >
      <img
        src={`https://images.unsplash.com/${area.photo}?w=300&q=80`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        alt=""
      />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${area.color}55 0%, ${area.color}ee 100%)` }} />
      <div style={{ position: 'absolute', inset: 0, padding: isLg ? 16 : 12, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ color: '#fff', fontSize: isLg ? 13 : 12, fontWeight: 800, lineHeight: 1.25 }}>{area.name}</div>
        {done > 0 && <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 3 }}>{done} gelernt</div>}
      </div>
    </button>
  )
}

export default function Home({ setView, setSelectedArea, setSelectedLevel, progress, preferences }) {
  const totalLearned = Object.values(progress).reduce((s, a) => s + Object.values(a).filter(p => p.learned).length, 0)
  const totalQuizzed = Object.values(progress).reduce((s, a) => s + Object.values(a).filter(p => p.quiz_score != null).length, 0)

  const recommendedIds = preferences?.jobAreas?.length > 0
    ? preferences.jobAreas
    : (preferences?.goal ? (GOAL_AREAS[preferences.goal] || []) : [])
  const recommended = AREAS.filter(a => recommendedIds.includes(a.id))

  return (
    <div style={{ padding: '40px 48px', maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>Willkommen bei LearnHub</h1>
        <p style={{ color: '#6B7280', fontSize: 15 }}>Wähle einen Fachbereich und starte deine Weiterbildung.</p>
      </div>

      {(totalLearned > 0 || totalQuizzed > 0) && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
          <StatCard label="Themen gelernt" value={totalLearned} color="#1D9E75" />
          <StatCard label="Quiz abgeschlossen" value={totalQuizzed} color="#F59E0B" />
        </div>
      )}

      {recommended.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1D9E75' }}>Empfohlen für dich</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
            {recommended.map(a => {
              const done = Object.values(progress[a.id] || {}).filter(p => p.learned).length
              return <AreaCard key={a.id} area={a} done={done} onClick={() => { setSelectedArea(a); setView('topics') }} />
            })}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>Alle Fachbereiche</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
        {AREAS.map(a => {
          const done = Object.values(progress[a.id] || {}).filter(p => p.learned).length
          return <AreaCard key={a.id} area={a} done={done} onClick={() => { setSelectedArea(a); setView('topics') }} size="lg" />
        })}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '16px 20px', minWidth: 140 }}>
      <div style={{ fontSize: 28, fontWeight: 600, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{label}</div>
    </div>
  )
}
