import { AREAS } from './Sidebar'

const GOAL_AREAS = {
  job_current: ['ict', 'management', 'hr'],
  job_change:  ['ict', 'marketing', 'hr'],
  refresh:     ['finanzen', 'vwl', 'recht'],
  exam:        ['finanzen', 'recht', 'vwl'],
}

export default function Home({ setView, setSelectedArea, setSelectedLevel, progress, preferences }) {
  const totalLearned = Object.values(progress).reduce((s, a) => s + Object.values(a).filter(p => p.learned).length, 0)
  const totalQuizzed = Object.values(progress).reduce((s, a) => s + Object.values(a).filter(p => p.quiz_score != null).length, 0)

  const recommendedIds = preferences?.goal ? (GOAL_AREAS[preferences.goal] || []) : []
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
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1D9E75' }}>⭐ Empfohlen für dich</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {recommended.map(a => {
              const done = Object.values(progress[a.id] || {}).filter(p => p.learned).length
              return (
                <button key={a.id} onClick={() => { setSelectedArea(a); setView('topics') }} style={{
                  background: 'linear-gradient(135deg, #F0FDF9, #fff)', border: '2px solid #1D9E75',
                  borderRadius: 12, padding: '20px', textAlign: 'left', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(29,158,117,0.12)'
                }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{a.icon}</div>
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{a.name}</div>
                  {done > 0 && <div style={{ fontSize: 12, color: '#1D9E75' }}>{done} gelernt</div>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>Alle Fachbereiche</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {AREAS.map(a => {
          const done = Object.values(progress[a.id] || {}).filter(p => p.learned).length
          return (
            <button key={a.id} onClick={() => { setSelectedArea(a); setView('topics') }} style={{
              background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12,
              padding: '20px', textAlign: 'left', cursor: 'pointer', transition: 'box-shadow .15s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{a.icon}</div>
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{a.name}</div>
              {done > 0 && <div style={{ fontSize: 12, color: '#1D9E75' }}>{done} gelernt</div>}
            </button>
          )
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
