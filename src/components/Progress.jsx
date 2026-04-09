import { AREAS } from './Sidebar'
import { BADGES } from '../lib/gamification'

function BadgeIcon({ iconId, color, size = 16 }) {
  const s = { stroke: color, fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const paths = {
    'check-circle': <><path {...s} d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline {...s} points="22 4 12 14.01 9 11.01"/></>,
    'star':         <polygon {...s} points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    'globe':        <><circle {...s} cx="12" cy="12" r="10"/><line {...s} x1="2" y1="12" x2="22" y2="12"/><path {...s} d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    'flame':        <path {...s} d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">{paths[iconId]}</svg>
  )
}

function AreaDot({ area }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: area.color, flexShrink: 0 }} />
    </div>
  )
}

export default function Progress({ progress, topics, stats, setSelectedArea, setSelectedTopic, setView }) {
  const all = Object.values(topics).flat()
  const learned = all.filter(t => progress[t.id]?.learned)
  const quizzed = all.filter(t => progress[t.id]?.quiz_score != null)
  const avgScore = quizzed.length
    ? Math.round(quizzed.reduce((s, t) => s + (progress[t.id].quiz_score / progress[t.id].quiz_total) * 100, 0) / quizzed.length)
    : null

  const earnedBadgeIds = stats?.badges || []
  const earnedBadges = BADGES.filter(b => earnedBadgeIds.includes(b.id))
  const lockedBadges = BADGES.filter(b => !earnedBadgeIds.includes(b.id))

  return (
    <div style={{ padding: '40px 48px', maxWidth: 800 }}>
      <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 28 }}>Mein Fortschritt</h2>

      <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
        <StatCard label="Themen gelernt" value={learned.length} color="#1D9E75" />
        <StatCard label="Quiz abgeschlossen" value={quizzed.length} color="#F59E0B" />
        {avgScore !== null && <StatCard label="Ø Quiz-Score" value={`${avgScore}%`} color="#6366F1" />}
      </div>

      {/* Badges */}
      {(earnedBadges.length > 0 || lockedBadges.length > 0) && (
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#374151' }}>Badges</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {earnedBadges.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid #1D9E75', borderRadius: 12, padding: '10px 14px' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(29,158,117,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BadgeIcon iconId={b.iconId} color="#1D9E75" size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{b.label}</div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>{b.desc}</div>
                </div>
              </div>
            ))}
            {lockedBadges.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8F9FA', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '10px 14px', opacity: 0.5 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BadgeIcon iconId={b.iconId} color="#9CA3AF" size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>{b.label}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {AREAS.map(a => {
        const areaTopics = (topics[a.id] || []).filter(t => progress[t.id])
        if (!areaTopics.length) return null
        return (
          <div key={a.id} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AreaDot area={a} />
              <span style={{ color: a.color, fontWeight: 600 }}>{a.name}</span>
            </div>
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
