import { supabase } from '../lib/supabase'
import { getLevelProgress } from '../lib/gamification'

const AREAS = [
  { id: 'ict', name: 'ICT & Informatik', icon: '💻' },
  { id: 'marketing', name: 'Marketing', icon: '📢' },
  { id: 'finanzen', name: 'Finanzen', icon: '📊' },
  { id: 'management', name: 'Management', icon: '🏢' },
  { id: 'hr', name: 'Personal (HR)', icon: '👥' },
  { id: 'recht', name: 'Recht', icon: '⚖️' },
  { id: 'verkauf', name: 'Verkauf', icon: '🤝' },
  { id: 'vwl', name: 'Volkswirtschaft', icon: '🌍' },
]

export { AREAS }

export default function Sidebar({ view, setView, selectedArea, setSelectedArea, user, progress, stats, onShowLanding }) {
  const totalTopics = Object.values(progress).reduce((s, a) => s + Object.keys(a).length, 0)

  const getAreaDone = (id) => Object.values(progress[id] || {}).filter(p => p.learned).length

  return (
    <nav style={{ width: 240, flexShrink: 0, background: '#111827', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0 }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: '#1D9E75', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>L</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>LearnHub</div>
            <div style={{ color: '#6B7280', fontSize: 11 }}>Weiterbildung</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        <NavItem icon="🏠" label="Übersicht" active={view === 'home' && !selectedArea} onClick={() => { setView('home'); setSelectedArea(null) }} />
        <NavItem icon="📈" label="Mein Fortschritt" active={view === 'progress'} onClick={() => { setView('progress'); setSelectedArea(null) }} badge={totalTopics > 0 ? totalTopics : null} />

        <div style={{ margin: '16px 8px 6px', fontSize: 11, color: '#4B5563', fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase' }}>Fachbereiche</div>

        {AREAS.map(a => {
          const done = getAreaDone(a.id)
          return (
            <NavItem key={a.id} icon={a.icon} label={a.name}
              active={selectedArea?.id === a.id}
              badge={done > 0 ? done : null}
              onClick={() => { setSelectedArea(a); setView('topics') }} />
          )
        })}
      </div>

      {/* User */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {stats && (
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(getLevelProgress(stats.xp) * 100, 100)}%`, height: '100%', background: '#1D9E75', borderRadius: 2 }} />
            </div>
            <span style={{ color: '#6B7280', fontSize: 11 }}>{stats.xp} XP</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
            {(user?.user_metadata?.full_name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#E5E7EB', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.user_metadata?.full_name || user?.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {onShowLanding && (
            <button onClick={onShowLanding} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF', borderRadius: 7, padding: '7px 8px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              🌐 Website
            </button>
          )}
          <button onClick={() => supabase.auth.signOut()} style={{ flex: 1, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', borderRadius: 7, padding: '7px 8px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            Abmelden
          </button>
        </div>
      </div>
    </nav>
  )
}

function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px', borderRadius: 8, marginBottom: 2, background: active ? 'rgba(29,158,117,0.15)' : 'none',
      border: 'none', cursor: 'pointer', color: active ? '#34D399' : '#9CA3AF', transition: 'all .15s'
    }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: active ? 500 : 400, flex: 1 }}>{label}</span>
      {badge != null && <span style={{ background: 'rgba(29,158,117,0.2)', color: '#34D399', fontSize: 11, fontWeight: 500, padding: '1px 7px', borderRadius: 10 }}>{badge}</span>}
    </button>
  )
}
