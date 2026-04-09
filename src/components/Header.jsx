import { LEVELS, getLevelProgress } from '../lib/gamification'

function StreakRing({ streak }) {
  const circumference = 2 * Math.PI * 10
  const filled = Math.min(streak, 7)
  const offset = circumference * (1 - filled / 7)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <svg width="28" height="28" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
        <circle cx="14" cy="14" r="10" fill="none" stroke="rgba(217,119,6,0.2)" strokeWidth="3"/>
        <circle cx="14" cy="14" r="10" fill="none" stroke="#d97706" strokeWidth="3"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"/>
      </svg>
      <span style={{ color: '#d97706', fontSize: 12, fontWeight: 700 }}>{streak}d</span>
    </div>
  )
}

const CrosshairIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="3"/>
    <line x1="12" y1="2" x2="12" y2="5"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="5" y2="12"/>
    <line x1="19" y1="12" x2="22" y2="12"/>
  </svg>
)

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

      {streak > 0 && <StreakRing streak={streak} />}

      {onTogglePanel && (
        <button onClick={onTogglePanel} style={{
          marginLeft: 'auto', background: showPanel ? '#1D9E75' : '#F0FDF9',
          border: `1px solid ${showPanel ? '#1D9E75' : '#A7F3D0'}`,
          color: showPanel ? '#fff' : '#065F46',
          borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          flexShrink: 0,
        }}>
          <CrosshairIcon />
          Mein Profil
        </button>
      )}
    </div>
  )
}
