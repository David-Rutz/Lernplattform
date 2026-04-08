# Icon & Visual Identity Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every emoji in LearnHub with Unsplash photo cards, inline SVG icons, and CSS shapes — zero emojis remain after this change.

**Architecture:** All changes are purely presentational. The AREAS data array in Sidebar.jsx is the single source of truth for color/photo per Fachbereich — all other components consume it. SVG icons are inlined directly in JSX (no external icon library). No data model, routing, or Supabase schema changes.

**Tech Stack:** React 18, Vite, inline SVG, Unsplash CDN photos (`https://images.unsplash.com/{photo-id}?w={size}&q=80`)

---

## File Map

| File | What changes |
|---|---|
| `src/components/Sidebar.jsx` | AREAS: add `color`/`photo`, remove `icon`; export `AreaChip`; SVG nav icons; remove 🌐 |
| `src/components/Home.jsx` | Photo cards for recommended + all areas; remove `a.icon`; remove ⭐ |
| `src/components/Header.jsx` | `StreakRing` SVG; crosshair SVG in profile button; remove 🔥🎯 |
| `src/components/NeedFinderPanel.jsx` | `StepIndicator` with numbered dots; GOAL/LEVEL options without emojis; `AreaChip` usage; remove 🎯✏️⭐ |
| `src/lib/gamification.js` | BADGES: `icon` → `iconId` string |
| `src/components/Progress.jsx` | `BadgeIcon` SVG; replace `a.icon` with colored dot; add badges section; accept `stats` prop |
| `src/App.jsx` | Pass `stats` to `<Progress>` |
| `src/components/LandingPage.jsx` | Photo area cards; SVG feature/level/list icons; remove all remaining emojis |

---

## Task 1: Sidebar.jsx — AREAS data + AreaChip + SVG nav icons

**Files:**
- Modify: `src/components/Sidebar.jsx`

- [ ] **Step 1: Replace the AREAS array and add AreaChip + SVG icons**

Replace the entire `src/components/Sidebar.jsx` file with:

```jsx
import { supabase } from '../lib/supabase'
import { getLevelProgress } from '../lib/gamification'

const AREAS = [
  { id: 'ict',        name: 'ICT & Informatik',  color: '#059669', photo: 'photo-1517694712202-14dd9538aa97' },
  { id: 'marketing',  name: 'Marketing',          color: '#db2777', photo: 'photo-1560472354-b33ff0c44a43' },
  { id: 'finanzen',   name: 'Finanzen',           color: '#d97706', photo: 'photo-1611974789855-9c2a0a7236a3' },
  { id: 'management', name: 'Management',         color: '#6366f1', photo: 'photo-1552664730-d307ca884978' },
  { id: 'hr',         name: 'Personal (HR)',      color: '#0891b2', photo: 'photo-1521737711867-e3b97375f902' },
  { id: 'recht',      name: 'Recht',              color: '#57534e', photo: 'photo-1589829545856-d10d557cf95f' },
  { id: 'verkauf',    name: 'Verkauf',            color: '#ea580c', photo: 'photo-1600880292203-757bb62b4baf' },
  { id: 'vwl',        name: 'Volkswirtschaft',    color: '#2563eb', photo: 'photo-1486325212027-8081e485255e' },
]

export { AREAS }

export function AreaChip({ area, active }) {
  return (
    <div style={{
      width: 28, height: 22, borderRadius: 5, overflow: 'hidden',
      flexShrink: 0, position: 'relative',
      boxShadow: active ? `0 0 0 1.5px ${area.color}` : 'none',
    }}>
      <img
        src={`https://images.unsplash.com/${area.photo}?w=60&q=70`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: active ? 1 : 0.7 }}
        alt=""
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: `${area.color}${active ? '66' : '59'}`,
      }} />
    </div>
  )
}

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)

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
        <NavItem icon={<HomeIcon />} label="Übersicht" active={view === 'home' && !selectedArea} onClick={() => { setView('home'); setSelectedArea(null) }} />
        <NavItem icon={<ChartIcon />} label="Mein Fortschritt" active={view === 'progress'} onClick={() => { setView('progress'); setSelectedArea(null) }} badge={totalTopics > 0 ? totalTopics : null} />

        <div style={{ margin: '16px 8px 6px', fontSize: 11, color: '#4B5563', fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase' }}>Fachbereiche</div>

        {AREAS.map(a => {
          const done = getAreaDone(a.id)
          const active = selectedArea?.id === a.id
          return (
            <button key={a.id} onClick={() => { setSelectedArea(a); setView('topics') }} style={{
              width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 10px', borderRadius: 8, marginBottom: 2,
              background: active ? `${a.color}22` : 'none',
              border: 'none', cursor: 'pointer',
              color: active ? a.color : '#9CA3AF', transition: 'all .15s'
            }}>
              <AreaChip area={a} active={active} />
              <span style={{ fontSize: 13, fontWeight: active ? 500 : 400, flex: 1 }}>{a.name}</span>
              {done > 0 && <span style={{ background: `${a.color}22`, color: a.color, fontSize: 11, fontWeight: 500, padding: '1px 7px', borderRadius: 10 }}>{done}</span>}
            </button>
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
              ← Website
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
      <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: active ? 500 : 400, flex: 1 }}>{label}</span>
      {badge != null && <span style={{ background: 'rgba(29,158,117,0.2)', color: '#34D399', fontSize: 11, fontWeight: 500, padding: '1px 7px', borderRadius: 10 }}>{badge}</span>}
    </button>
  )
}
```

- [ ] **Step 2: Verify in dev server**

Run: `npm run dev` in `/workspaces/Lernplattform`

Open the dashboard. Check:
- Sidebar shows photo thumbnails per Fachbereich (not emojis)
- Active area has colored background tint matching its color
- Home and Fortschritt nav items show house/bar-chart SVG icons
- Website button shows `← Website` (no 🌐)

- [ ] **Step 3: Commit**

```bash
git add src/components/Sidebar.jsx
git commit -m "feat: replace emoji icons in Sidebar with photo chips and SVG nav icons"
```

---

## Task 2: Home.jsx — Photo area cards

**Files:**
- Modify: `src/components/Home.jsx`

- [ ] **Step 1: Replace Home.jsx**

Replace the entire `src/components/Home.jsx` with:

```jsx
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
```

- [ ] **Step 2: Verify in dev server**

Open the dashboard → Übersicht. Check:
- Area cards show photo thumbnails with gradient overlay
- "Empfohlen für dich" heading has no ⭐
- Hover on cards causes subtle lift effect

- [ ] **Step 3: Commit**

```bash
git add src/components/Home.jsx
git commit -m "feat: replace emoji area cards in Home with photo + gradient overlay cards"
```

---

## Task 3: Header.jsx — StreakRing + crosshair icon

**Files:**
- Modify: `src/components/Header.jsx`

- [ ] **Step 1: Replace Header.jsx**

Replace the entire `src/components/Header.jsx` with:

```jsx
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
```

- [ ] **Step 2: Verify in dev server**

Open the dashboard header. Check:
- Level pill shows (no emoji)
- XP bar shows
- If streak > 0: orange SVG ring shows with day count (no 🔥)
- "Mein Profil" button shows crosshair SVG icon (no 🎯)

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.jsx
git commit -m "feat: replace streak emoji and profile emoji in Header with SVG ring and crosshair"
```

---

## Task 4: NeedFinderPanel.jsx — StepIndicator + option icons

**Files:**
- Modify: `src/components/NeedFinderPanel.jsx`

- [ ] **Step 1: Replace NeedFinderPanel.jsx**

Replace the entire `src/components/NeedFinderPanel.jsx` with:

```jsx
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
```

- [ ] **Step 2: Verify in dev server**

Open landing page (not logged in). Check:
- NeedFinder panel has crosshair SVG in header (no 🎯)
- Numbered dot step indicator shows (3 circles with connecting line)
- Goal options show text only (no emoji)
- Level options show colored dot (no 🌱🌿🌳)
- Recommended areas show AreaChip thumbnails

Open dashboard → Mein Profil. Check:
- Profile summary shows crosshair, no ✏️ on Ändern button

- [ ] **Step 3: Commit**

```bash
git add src/components/NeedFinderPanel.jsx
git commit -m "feat: replace NeedFinder emojis with StepIndicator dots, AreaChip thumbnails, SVG icons"
```

---

## Task 5: gamification.js + Progress.jsx — BadgeIcon + badges section

**Files:**
- Modify: `src/lib/gamification.js`
- Modify: `src/components/Progress.jsx`
- Modify: `src/App.jsx` (pass `stats` to Progress)

- [ ] **Step 1: Update gamification.js BADGES**

In `src/lib/gamification.js`, replace the BADGES array (lines 12–17):

```js
export const BADGES = [
  { id: 'first_step',  label: 'Erster Schritt', iconId: 'check-circle', desc: 'Erstes Thema gelernt' },
  { id: 'quiz_master', label: 'Quiz-Meister',   iconId: 'star',         desc: '5 Quizze mit 100% bestanden' },
  { id: 'allrounder',  label: 'Allrounder',     iconId: 'globe',        desc: 'Alle 8 Fachbereiche angetastet' },
  { id: 'streak_7',    label: 'Streak-7',       iconId: 'flame',        desc: '7 Tage in Folge gelernt' },
]
```

- [ ] **Step 2: Replace Progress.jsx**

Replace the entire `src/components/Progress.jsx` with:

```jsx
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
```

- [ ] **Step 3: Pass stats to Progress in App.jsx**

In `src/App.jsx`, find the Progress component usage (around line 184) and add the `stats` prop:

```jsx
{view === 'progress' && (
  <Progress
    progress={progress}
    topics={topics}
    stats={stats}
    setSelectedArea={setSelectedArea}
    setSelectedTopic={setSelectedTopic}
    setView={setView}
  />
)}
```

- [ ] **Step 4: Verify in dev server**

Open dashboard → Mein Fortschritt. Check:
- Area section headers show colored dot + area name in area color (no emoji)
- Badges section shows: earned badges with SVG icons in green circles, locked badges dimmed (if no badges earned yet, all will be dimmed)

- [ ] **Step 5: Commit**

```bash
git add src/lib/gamification.js src/components/Progress.jsx src/App.jsx
git commit -m "feat: replace badge emojis with SVG BadgeIcon, add badges section to Progress, color-coded area headers"
```

---

## Task 6: LandingPage.jsx — Photo area cards + SVG icons throughout

**Files:**
- Modify: `src/components/LandingPage.jsx`

This task removes all remaining emoji usage from the landing page. There are 6 spots:
1. Fachbereiche grid (`a.icon` at line 350)
2. Area view hero (`{selectedArea.icon}` at line 224)
3. Area topics list level icons (🌱🌿🌳📚 at line 255)
4. Topic preview level indicator (🌱🌿🌳 at lines 182-183)
5. "Was dich erwartet" list (📖🧠⭐ at lines 165-167)
6. FEATURES array emojis (🤖🇨🇭🎮 at line 365)
7. Mobile bottom bar (🎯 at line 413)
8. Hero badge (✨ at line 308) — replace with a styled dot

- [ ] **Step 1: Add SVG icon helpers and update FEATURES at top of LandingPage.jsx**

Find and replace the FEATURES constant (lines 6–10):

```jsx
const BookIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
)
const FlagIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
)
const TrophyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 22 12 17 16 22"/><polyline points="7 10 7 4 17 4 17 10"/><path d="M7 10a5 5 0 0 0 10 0"/><line x1="12" y1="17" x2="12" y2="22"/><path d="M7 4H5a2 2 0 0 0-2 2v1a5 5 0 0 0 5 5"/><path d="M17 4h2a2 2 0 0 1 2 2v1a5 5 0 0 1-5 5"/>
  </svg>
)

const FEATURES = [
  { Icon: BookIcon,   title: 'KI-Lerninhalte',   desc: 'Personalisiert für dein Level und Fachbereich' },
  { Icon: FlagIcon,   title: 'Schweizer Kontext', desc: 'Praxisbeispiele aus dem Schweizer Berufsalltag' },
  { Icon: TrophyIcon, title: 'Gamification',      desc: 'XP sammeln, Level aufsteigen, Badges gewinnen' },
]
```

- [ ] **Step 2: Replace hero badge ✨ (line ~308)**

Find:
```jsx
✨ KI-gestützt · Schweizer Kontext · Kostenlos
```

Replace with:
```jsx
<span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6EE7B7', display: 'inline-block', marginRight: 2 }} />
{' '}KI-gestützt · Schweizer Kontext · Kostenlos
```

- [ ] **Step 3: Replace Fachbereiche grid area cards (line ~342–353)**

Find the Fachbereiche grid inside `<section id="fachbereiche"`. Replace the inner button JSX:

```jsx
<div className="areas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))', gap: 16, maxWidth: 720, margin: '0 auto' }}>
  {AREAS.map(a => (
    <button key={a.id} onClick={() => handleAreaClick(a)} className="area-card" style={{
      position: 'relative', borderRadius: 14, overflow: 'hidden',
      aspectRatio: '3/4', cursor: 'pointer', border: 'none', padding: 0,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}>
      <img src={`https://images.unsplash.com/${a.photo}?w=300&q=80`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${a.color}66 0%, ${a.color}ee 100%)` }} />
      <div style={{ position: 'absolute', inset: 0, padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ color: '#fff', fontSize: 12, fontWeight: 800, lineHeight: 1.25 }}>{a.name}</div>
      </div>
    </button>
  ))}
</div>
```

- [ ] **Step 4: Replace area hero icon (line ~224)**

Find:
```jsx
<div style={{ fontSize: 48, marginBottom: 12 }}>{selectedArea.icon}</div>
```

Replace with:
```jsx
<div style={{ width: 56, height: 56, borderRadius: 16, overflow: 'hidden', margin: '0 auto 12px', boxShadow: `0 0 0 3px ${selectedArea.color}` }}>
  <img src={`https://images.unsplash.com/${selectedArea.photo}?w=120&q=80`}
    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
</div>
```

- [ ] **Step 5: Replace topic list level icons (line ~254–256)**

Find:
```jsx
<div style={{ width: 44, height: 44, background: `${color}15`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
  {t.level === 'einsteiger' ? '🌱' : t.level === 'fortgeschrittene' ? '🌿' : t.level === 'experte' ? '🌳' : '📚'}
</div>
```

Replace with:
```jsx
<div style={{ width: 44, height: 44, background: `${color}15`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
  <div style={{ width: 16, height: 16, borderRadius: '50%', background: color }} />
</div>
```

- [ ] **Step 6: Replace topic preview level icon (lines ~181–183)**

Find:
```jsx
<div style={{ width: 36, height: 36, background: `${color}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
  {selectedTopic.level === 'einsteiger' ? '🌱' : selectedTopic.level === 'fortgeschrittene' ? '🌿' : '🌳'}
</div>
```

Replace with:
```jsx
<div style={{ width: 36, height: 36, background: `${color}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <div style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
</div>
```

- [ ] **Step 7: Replace "Was dich erwartet" list icons (lines ~164–174)**

Find:
```jsx
{[
  { icon: '📖', text: 'Strukturierter Lerntext (ca. 300 Wörter)' },
  { icon: '🧠', text: '5 Multiple-Choice-Quizfragen zum Testen' },
  { icon: '⭐', text: 'XP verdienen und Level aufsteigen' },
].map((item, i) => (
  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F8F9FA', borderRadius: 10 }}>
    <span style={{ fontSize: 18 }}>{item.icon}</span>
    <span style={{ fontSize: 14, color: '#374151' }}>{item.text}</span>
  </div>
))}
```

Replace with:
```jsx
{[
  'Strukturierter Lerntext (ca. 300 Wörter)',
  '5 Multiple-Choice-Quizfragen zum Testen',
  'XP verdienen und Level aufsteigen',
].map((text, i) => (
  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F8F9FA', borderRadius: 10 }}>
    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', flexShrink: 0 }} />
    <span style={{ fontSize: 14, color: '#374151' }}>{text}</span>
  </div>
))}
```

- [ ] **Step 8: Replace topic preview CTA 🚀 (line ~198)**

Find:
```jsx
<div style={{ fontSize: 20, marginBottom: 8 }}>🚀</div>
```

Replace with:
```jsx
<div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
</div>
```

- [ ] **Step 9: Update FEATURES rendering (line ~363–369)**

Find:
```jsx
{FEATURES.map((f, i) => (
  <div key={i} style={{ padding: '28px 24px', background: '#F8F9FA', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
    <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
```

Replace with:
```jsx
{FEATURES.map((f, i) => (
  <div key={i} style={{ padding: '28px 24px', background: '#F8F9FA', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
    <div style={{ marginBottom: 12 }}><f.Icon /></div>
```

- [ ] **Step 10: Replace mobile bottom bar 🎯 (line ~413)**

Find:
```jsx
<span style={{ fontSize: 13, fontWeight: 600 }}>🎯 Lernpfad personalisieren</span>
```

Replace with:
```jsx
<span style={{ fontSize: 13, fontWeight: 600 }}>Lernpfad personalisieren</span>
```

- [ ] **Step 11: Verify in dev server**

Open landing page (not logged in). Check:
- Hero badge shows green dot (no ✨)
- Fachbereiche grid shows photo cards with color overlays (no emoji)
- Features section shows SVG icons (no 🤖🇨🇭🎮)
- Click a Fachbereich: area hero shows photo thumbnail (no large emoji)
- Topic list items show colored dot (no 🌱🌿🌳)
- Click a topic: level icon is colored circle (no 🌱🌿🌳), "Was dich erwartet" list shows green dots, CTA has arrow SVG (no 🚀)
- Mobile: bottom bar shows "Lernpfad personalisieren" (no 🎯)

- [ ] **Step 12: Commit**

```bash
git add src/components/LandingPage.jsx
git commit -m "feat: replace all LandingPage emojis with photo cards, SVG icons, and colored dots"
```

---

## Self-Review

**Spec coverage check:**

| Spec section | Task |
|---|---|
| AREAS array with color/photo, no icon | Task 1 |
| AreaChip component (28×22px thumbnail) | Task 1 |
| SVG nav icons (Home, Chart) | Task 1 |
| Home dashboard photo cards | Task 2 |
| Remove ⭐ from "Empfohlen für dich" | Task 2 |
| StreakRing SVG | Task 3 |
| CrosshairIcon in Header button | Task 3 |
| StepIndicator numbered dots | Task 4 |
| GOAL_OPTIONS without emoji | Task 4 |
| LEVEL_OPTIONS with colored dots | Task 4 |
| AreaChip in NeedFinderPanel | Task 4 |
| Remove 🎯✏️⭐ from NeedFinderPanel | Task 4 |
| BADGES icon → iconId | Task 5 |
| BadgeIcon SVG component | Task 5 |
| Badge display in Progress | Task 5 |
| Area heading: colored dot instead of emoji | Task 5 |
| LandingPage photo area cards | Task 6 |
| SVG feature icons | Task 6 |
| Level icons → colored dots | Task 6 |
| Remove all remaining emoji (🚀🎯✨📖🧠⭐) | Task 6 |

All spec requirements covered. No placeholders. No external dependencies added.
