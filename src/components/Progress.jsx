import { AREAS } from './Sidebar'

export default function Progress({ progress, topics, setSelectedArea, setSelectedTopic, setView }) {
  const all = Object.values(topics).flat()
  const learned = all.filter(t => progress[t.id]?.learned)
  const quizzed = all.filter(t => progress[t.id]?.quiz_score != null)
  const avgScore = quizzed.length
    ? Math.round(quizzed.reduce((s, t) => s + (progress[t.id].quiz_score / progress[t.id].quiz_total) * 100, 0) / quizzed.length)
    : null

  return (
    <div style={{ padding: '40px 48px', maxWidth: 800 }}>
      <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 28 }}>Mein Fortschritt</h2>

      <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
        <StatCard label="Themen gelernt" value={learned.length} color="#1D9E75" />
        <StatCard label="Quiz abgeschlossen" value={quizzed.length} color="#F59E0B" />
        {avgScore !== null && <StatCard label="Ø Quiz-Score" value={`${avgScore}%`} color="#6366F1" />}
      </div>

      {AREAS.map(a => {
        const areaTopics = (topics[a.id] || []).filter(t => progress[t.id])
        if (!areaTopics.length) return null
        return (
          <div key={a.id} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 10 }}>{a.icon} {a.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {areaTopics.map(t => {
                const p = progress[t.id]
                return (
                  <button key={t.id} onClick={() => { setSelectedArea(a); setSelectedTopic(t); setView('learn') }} style={{
                    background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10,
                    padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit'
                  }}>
                    <div style={{ flex: 1, fontSize: 14 }}>{t.name}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {p?.learned && <span style={{ fontSize: 11, background: '#E1F5EE', color: '#085041', padding: '2px 8px', borderRadius: 20 }}>Gelernt</span>}
                      {p?.quiz_score != null && <span style={{ fontSize: 11, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 20 }}>{p.quiz_score}/{p.quiz_total}</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {!learned.length && !quizzed.length && (
        <p style={{ color: '#9CA3AF', fontSize: 14 }}>Noch kein Fortschritt. Wähle einen Fachbereich und starte dein erstes Thema!</p>
      )}
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
