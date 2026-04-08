import { LEVELS, getLevelProgress } from '../lib/gamification'

export default function Header({ stats, onTogglePanel, showPanel }) {
  const xp = stats?.xp ?? 0
  const level = stats?.level ?? 1
  const streak = stats?.streak ?? 0
  const levelInfo = LEVELS.find(l => l.level === level) || LEVELS[0]
  const progress = getLevelProgress(xp)
  const nextLevel = LEVELS.find(l => l.level === level + 1)

  return (
    <div style={{
      background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)',
      padding: '10px 32px', display: 'flex', alignItems: 'center', gap: 20,
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ background: '#1D9E75', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
          Lv.{level} {levelInfo.name}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 120, maxWidth: 260 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 4 }}>
          <span>{xp} XP</span>
          {nextLevel && <span>→ {nextLevel.minXp} XP</span>}
        </div>
        <div style={{ height: 6, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(progress * 100, 100)}%`, height: '100%', background: '#1D9E75', borderRadius: 4, transition: 'width .4s ease' }} />
        </div>
      </div>

      {streak > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#F59E0B', fontWeight: 600 }}>
          🔥 {streak} Tag{streak !== 1 ? 'e' : ''}
        </div>
      )}

      {onTogglePanel && (
        <button onClick={onTogglePanel} style={{
          marginLeft: 'auto', background: showPanel ? '#1D9E75' : '#F0FDF9',
          border: `1px solid ${showPanel ? '#1D9E75' : '#A7F3D0'}`,
          color: showPanel ? '#fff' : '#065F46',
          borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          flexShrink: 0,
        }}>
          🎯 Mein Profil
        </button>
      )}
    </div>
  )
}
