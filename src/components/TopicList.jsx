export default function TopicList({ area, topics, progress, onSelect }) {
  if (!topics.length) return (
    <div style={{ padding: '40px 48px' }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{area.icon} {area.name}</h2>
      <p style={{ color: '#6B7280' }}>Keine Themen verfügbar.</p>
    </div>
  )

  return (
    <div style={{ padding: '40px 48px', maxWidth: 720 }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>{area.icon} {area.name}</h2>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>{topics.length} Themen</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {topics.map(t => {
          const p = progress[t.id]
          return (
            <button key={t.id} onClick={() => onSelect(t)} style={{
              background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12,
              padding: '16px 20px', textAlign: 'left', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'box-shadow .15s'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 2 }}>{t.name}</div>
                {t.level && <div style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'capitalize' }}>{t.level}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {p?.learned && <span style={{ fontSize: 11, background: '#E1F5EE', color: '#085041', padding: '2px 8px', borderRadius: 20 }}>Gelernt</span>}
                {p?.quiz_score != null && <span style={{ fontSize: 11, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 20 }}>{p.quiz_score}/{p.quiz_total} Quiz</span>}
              </div>
              <span style={{ color: '#9CA3AF', fontSize: 16 }}>›</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
