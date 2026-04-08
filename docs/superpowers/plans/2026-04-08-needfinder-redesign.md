# Need Finder Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Need Finder as a persistent narrow right-column panel on the landing page (pre-login) and as an always-editable "Mein Profil" panel in the logged-in dashboard, with AI job-mapping and a glassmorphism Auth page.

**Architecture:** A new `NeedFinderPanel.jsx` component handles both contexts (landing + dashboard) via a `context` prop. On the landing page, the main home view wraps existing content in a flex layout with the 280px panel on the right. After login, the panel lives in the App.jsx dashboard layout as a right column. Auth.jsx is fully restyled with glassmorphism to match the landing page.

**Tech Stack:** React 18 + Vite (no react-router), Supabase JS v2, Claude API (anthropic-dangerous-direct-browser-access), localStorage for preferences persistence.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/claude.js` | Modify | Add `mapJobToAreas(job)` — calls Claude to map free-text job → area IDs |
| `src/components/NeedFinderPanel.jsx` | Create | 3-step panel: Beruf (freitext + live AI mapping), Ziel, Niveau + profile summary mode |
| `src/components/LandingPage.jsx` | Modify | Wrap home view in flex layout, add NeedFinderPanel right column, add mobile modal |
| `src/components/Auth.jsx` | Modify | Full glassmorphism restyle matching landing page style |
| `src/App.jsx` | Modify | Add NeedFinderPanel to dashboard layout, remove old NeedFinder modal + state |
| `src/components/Home.jsx` | Modify | Use `jobAreas` from preferences for recommendations (primary over goal-based) |
| `src/components/NeedFinder.jsx` | Delete | Replaced by NeedFinderPanel |

---

## Task 1: `mapJobToAreas` in claude.js

**Files:**
- Modify: `src/lib/claude.js`

No test framework exists — verification is via `npm run dev` (manual browser check noted at end of task).

- [ ] **Step 1: Add `mapJobToAreas` export at the end of `src/lib/claude.js`**

Append after the last export (`generateQuiz`):

```js
export async function mapJobToAreas(job) {
  if (!job || job.trim().length < 2) return []
  const VALID_IDS = ['ict', 'marketing', 'finanzen', 'management', 'hr', 'recht', 'verkauf', 'vwl']
  try {
    const text = await callClaude(
      `Welche 1-2 der folgenden Fachbereiche passen am besten zum Beruf "${job.trim()}"? ` +
      `Antworte NUR mit den Fachbereich-IDs, kommagetrennt, keine anderen Zeichen. ` +
      `Verfügbare IDs: ict, marketing, finanzen, management, hr, recht, verkauf, vwl`
    )
    return text
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(id => VALID_IDS.includes(id))
      .slice(0, 2)
  } catch {
    return []
  }
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /workspaces/Lernplattform && npm run build 2>&1 | tail -5
```

Expected: `✓ built in` with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/claude.js
git commit -m "feat: add mapJobToAreas to claude.js for Need Finder job mapping"
```

---

## Task 2: NeedFinderPanel component

**Files:**
- Create: `src/components/NeedFinderPanel.jsx`

This component handles two contexts:
- `context="landing"`: shows the 3-step flow, "Jetzt starten →" calls `onStartAuth()`
- `context="dashboard"`: shows profile summary or editing flow, saves to localStorage on complete

Props:
- `preferences` — `{ job, jobAreas, goal, level }` or `null`
- `onComplete(prefs)` — called when the flow finishes (saves prefs, updates parent state)
- `onStartAuth()` — called when user clicks "Jetzt starten →" (landing only; pass `null` in dashboard)
- `context` — `"landing"` | `"dashboard"`

- [ ] **Step 1: Create `src/components/NeedFinderPanel.jsx`**

```jsx
import { useState, useEffect, useRef } from 'react'
import { mapJobToAreas } from '../lib/claude'
import { AREAS } from './Sidebar'

const GOAL_OPTIONS = [
  { value: 'job_current', label: 'Weiterbildung im aktuellen Job', icon: '💼' },
  { value: 'job_change',  label: 'Jobwechsel vorbereiten',        icon: '🚀' },
  { value: 'exam',        label: 'Prüfung / Zertifikat ablegen',  icon: '📋' },
  { value: 'general',     label: 'Allgemeinwissen aufbauen',      icon: '🌍' },
]

const LEVEL_OPTIONS = [
  { value: 'einsteiger',       label: 'Einsteiger',       icon: '🌱' },
  { value: 'fortgeschrittene', label: 'Fortgeschrittener', icon: '🌿' },
  { value: 'experte',          label: 'Experte',           icon: '🌳' },
]

export default function NeedFinderPanel({ preferences, onComplete, onStartAuth, context }) {
  const [editing, setEditing] = useState(!preferences)
  const [job, setJob] = useState(preferences?.job || '')
  const [jobAreas, setJobAreas] = useState(preferences?.jobAreas || [])
  const [goal, setGoal] = useState(preferences?.goal || '')
  const [level, setLevel] = useState(preferences?.level || '')
  const [mapping, setMapping] = useState(false)
  const debounceRef = useRef(null)

  // Debounced AI mapping when job input changes
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

  // ── PROFILE SUMMARY (dashboard, not editing) ─────────────────────────
  if (context === 'dashboard' && !editing) {
    const goalLabel = GOAL_OPTIONS.find(o => o.value === preferences?.goal)
    const levelLabel = LEVEL_OPTIONS.find(o => o.value === preferences?.level)
    return (
      <aside style={panelStyle}>
        <div style={headerStyle}>
          <span style={{ fontSize: 14 }}>🎯</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>Mein Profil</span>
          <button onClick={() => setEditing(true)} style={editBtnStyle}>✏️ Ändern</button>
        </div>

        <div style={{ background: '#F0FDF9', borderRadius: 10, padding: '12px', marginBottom: 14 }}>
          <div style={profileLabelStyle}>DEIN PROFIL</div>
          <div style={profileRowStyle}>💼 {preferences?.job || '—'}</div>
          {goalLabel && <div style={profileRowStyle}>{goalLabel.icon} {goalLabel.label}</div>}
          {levelLabel && <div style={profileRowStyle}>{levelLabel.icon} {levelLabel.label}</div>}
        </div>

        {recommendedAreas.length > 0 && (
          <>
            <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 8 }}>Empfohlen für dich:</div>
            {recommendedAreas.map(a => (
              <div key={a.id} style={{ fontSize: 12, color: '#1D9E75', fontWeight: 600, marginBottom: 4 }}>
                → {a.icon} {a.name}
              </div>
            ))}
          </>
        )}

        <button onClick={() => { setJob(''); setJobAreas([]); setGoal(''); setLevel(''); setEditing(true) }}
          style={{ marginTop: 14, width: '100%', background: 'none', border: 'none', color: '#9CA3AF', fontSize: 11, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
          Profil neu erstellen
        </button>
      </aside>
    )
  }

  // ── FLOW (landing page or editing in dashboard) ───────────────────────
  return (
    <aside style={panelStyle}>
      <div style={headerStyle}>
        <span style={{ fontSize: 14 }}>🎯</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Lernpfad-Finder</span>
        {context === 'dashboard' && (
          <button onClick={() => setEditing(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 11, cursor: 'pointer' }}>✕</button>
        )}
      </div>

      <div style={{ padding: '14px', flex: 1, overflowY: 'auto' }}>
        {/* Step 1: Beruf */}
        <div style={stepWrapStyle}>
          <div style={stepLabelStyle}>① Beruf</div>
          <input
            type="text"
            value={job}
            onChange={e => setJob(e.target.value)}
            placeholder="z.B. Softwareentwickler…"
            style={inputStyle}
          />
          {mapping && <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>Analysiere…</div>}
          {!mapping && jobAreas.length > 0 && (
            <div style={{ marginTop: 6 }}>
              {AREAS.filter(a => jobAreas.includes(a.id)).map(a => (
                <div key={a.id} style={{ fontSize: 10, color: '#1D9E75', fontWeight: 600 }}>→ {a.icon} {a.name}</div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Ziel */}
        <div style={stepWrapStyle}>
          <div style={stepLabelStyle}>② Ziel</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {GOAL_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setGoal(o.value)} style={optionStyle(goal === o.value)}>
                <span>{o.icon}</span>
                <span style={{ fontSize: 10, fontWeight: goal === o.value ? 600 : 400, color: goal === o.value ? '#065F46' : '#374151' }}>{o.label}</span>
                {goal === o.value && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Niveau */}
        <div style={stepWrapStyle}>
          <div style={stepLabelStyle}>③ Niveau</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {LEVEL_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setLevel(o.value)} style={optionStyle(level === o.value)}>
                <span>{o.icon}</span>
                <span style={{ fontSize: 10, fontWeight: level === o.value ? 600 : 400, color: level === o.value ? '#065F46' : '#374151' }}>{o.label}</span>
                {level === o.value && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Live recommendation */}
        {jobAreas.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #F0FDF9, #fff)', border: '1.5px solid #1D9E75', borderRadius: 10, padding: '10px', marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: '#1D9E75', fontWeight: 700, marginBottom: 6 }}>⭐ EMPFOHLEN</div>
            {AREAS.filter(a => jobAreas.includes(a.id)).map(a => (
              <div key={a.id} style={{ fontSize: 11, color: '#065F46', fontWeight: 600 }}>{a.icon} {a.name}</div>
            ))}
            {goal || level ? <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 4 }}>Aktualisiert live</div> : null}
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
  width: 280,
  minWidth: 280,
  background: '#fff',
  borderLeft: '3px solid #1D9E75',
  display: 'flex',
  flexDirection: 'column',
  position: 'sticky',
  top: 0,
  height: '100vh',
  overflowY: 'auto',
  boxShadow: '-4px 0 16px rgba(0,0,0,0.06)',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

const headerStyle = {
  background: '#1D9E75',
  padding: '12px 14px',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexShrink: 0,
}

const stepWrapStyle = { marginBottom: 14 }

const stepLabelStyle = { fontSize: 10, color: '#9CA3AF', marginBottom: 5, fontWeight: 500 }

const inputStyle = {
  width: '100%',
  padding: '7px 10px',
  border: '1.5px solid #E5E7EB',
  borderRadius: 8,
  fontSize: 11,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const optionStyle = (selected) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 8px',
  border: `1.5px solid ${selected ? '#1D9E75' : '#E5E7EB'}`,
  borderRadius: 7,
  background: selected ? '#F0FDF9' : '#fff',
  cursor: 'pointer',
  textAlign: 'left',
  fontSize: 11,
  fontFamily: 'inherit',
  width: '100%',
})

const ctaBtnStyle = {
  width: '100%',
  padding: '10px',
  background: '#1D9E75',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  marginTop: 4,
  fontFamily: 'inherit',
}

const editBtnStyle = {
  marginLeft: 'auto',
  background: 'rgba(255,255,255,0.15)',
  border: 'none',
  borderRadius: 6,
  padding: '2px 8px',
  fontSize: 10,
  color: '#fff',
  cursor: 'pointer',
}

const profileLabelStyle = { fontSize: 9, color: '#065F46', fontWeight: 700, marginBottom: 6, letterSpacing: '.05em' }
const profileRowStyle = { fontSize: 11, color: '#374151', marginBottom: 3 }
```

- [ ] **Step 2: Verify build passes**

```bash
cd /workspaces/Lernplattform && npm run build 2>&1 | tail -5
```

Expected: `✓ built in` with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/NeedFinderPanel.jsx
git commit -m "feat: add NeedFinderPanel component (pre-login + dashboard)"
```

---

## Task 3: LandingPage.jsx — add right panel + mobile modal

**Files:**
- Modify: `src/components/LandingPage.jsx`

The panel only appears on the main home view (`view === 'home'`). Area and topic preview views remain full-width.

On mobile (< 768px), the panel is hidden and replaced with a sticky bottom bar + modal.

- [ ] **Step 1: Add import for NeedFinderPanel at the top of `src/components/LandingPage.jsx`**

Replace:
```js
import { useState, useEffect } from 'react'
import { AREAS } from './Sidebar'
import { supabase } from '../lib/supabase'
```

With:
```js
import { useState } from 'react'
import { AREAS } from './Sidebar'
import { supabase } from '../lib/supabase'
import NeedFinderPanel from './NeedFinderPanel'
```

- [ ] **Step 2: Add panel state and mobile modal state to the `LandingPage` function**

After line `const [loadingTopics, setLoadingTopics] = useState(false)`, add:

```js
const [lpPreferences, setLpPreferences] = useState(() => {
  try { return JSON.parse(localStorage.getItem('learnhub_preferences') || 'null') } catch { return null }
})
const [showMobilePanel, setShowMobilePanel] = useState(false)
```

- [ ] **Step 3: Add mobile panel CSS rules to the `CSS` string**

Inside the existing `const CSS = \`...\`` string, add these rules before the closing backtick:

```css
@media (max-width: 768px) {
  .needfinder-panel { display: none !important; }
  .needfinder-mobile-bar { display: flex !important; }
}
@media (min-width: 769px) {
  .needfinder-mobile-bar { display: none !important; }
}
.needfinder-mobile-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 90;
  background: #1D9E75; color: #fff; padding: 14px 20px;
  display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.12);
}
```

- [ ] **Step 4: Replace the main home view `return` statement**

Find the line:
```jsx
// ── MAIN LANDING PAGE ───────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111827', overflowX: 'hidden' }}>
```

Replace the entire main `return (...)` block (from that comment down to the final `}`) with:

```jsx
// ── MAIN LANDING PAGE ───────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111827' }}>
      <style>{CSS}</style>

      {/* Left: existing landing content */}
      <div style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        <Navbar showBack={false} />

        {/* HERO */}
        <section style={{
          background: 'linear-gradient(160deg, #064E3B 0%, #065F46 45%, #1D9E75 100%)',
          padding: '72px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -60, left: -60, width: 300, height: 300, background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -80, right: -40, width: 400, height: 400, background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />

          <div className="lp-fade" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '5px 16px', fontSize: 13, color: '#A7F3D0', marginBottom: 20, backdropFilter: 'blur(4px)' }}>
            ✨ KI-gestützt · Schweizer Kontext · Kostenlos
          </div>

          <h1 className="lp-fade-2" style={{ color: '#fff', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Deine Weiterbildung.<br /><span style={{ color: '#6EE7B7' }}>Dein Tempo.</span>
          </h1>

          <p className="lp-fade-3" style={{ color: 'rgba(255,255,255,0.72)', fontSize: 18, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px', fontWeight: 400 }}>
            Lerne in 8 Fachbereichen — persönlich zugeschnitten auf dein Niveau und deine Ziele.
          </p>

          <div className="lp-fade-3 hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onStartAuth} className="cta-btn" style={{ background: '#fff', color: '#064E3B', border: 'none', borderRadius: 10, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              Jetzt kostenlos starten →
            </button>
            <button onClick={handleThemen} className="cta-btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '14px 24px', fontSize: 15, fontWeight: 500, cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
              Themen entdecken ↓
            </button>
          </div>
        </section>

        {/* FACHBEREICHE with parallax background */}
        <section id="fachbereiche" style={{
          position: 'relative', padding: '64px 24px', textAlign: 'center',
          backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,40,30,0.75)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 12, color: '#6EE7B7', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>Fachbereiche</div>
            <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em' }}>Was möchtest du lernen?</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, marginBottom: 40 }}>Klicke auf einen Bereich um die Themen zu entdecken</p>

            <div className="areas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))', gap: 16, maxWidth: 720, margin: '0 auto' }}>
              {AREAS.map(a => (
                <button key={a.id} onClick={() => handleAreaClick(a)} className="area-card" style={{
                  background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.18)', borderRadius: 14,
                  padding: '20px 12px', cursor: 'pointer', textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icon}</div>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{a.name}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section style={{ background: '#fff', padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#1D9E75', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>Warum LearnHub?</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 48, letterSpacing: '-0.01em' }}>Lernen neu gedacht</h2>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, maxWidth: 840, margin: '0 auto' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ padding: '28px 24px', background: '#F8F9FA', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ background: '#F8F9FA', padding: '64px 24px', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 12, color: '#1D9E75', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>Stimmen</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 40, letterSpacing: '-0.01em' }}>Was Lernende sagen</h2>
          <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 900, margin: '0 auto' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', textAlign: 'left', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 24, color: '#1D9E75', marginBottom: 12, lineHeight: 1 }}>"</div>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 20 }}>{t.text}</p>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER CTA */}
        <section style={{ background: 'linear-gradient(160deg, #064E3B 0%, #1D9E75 100%)', padding: '72px 24px', textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>Bereit loszulegen?</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 32 }}>Kostenlos registrieren und sofort mit dem Lernen beginnen.</p>
          <button onClick={onStartAuth} className="cta-btn" style={{ background: '#fff', color: '#064E3B', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            Jetzt kostenlos starten →
          </button>
        </section>
      </div>

      {/* Right: NeedFinderPanel (hidden on mobile) */}
      <div className="needfinder-panel">
        <NeedFinderPanel
          preferences={lpPreferences}
          onComplete={(prefs) => setLpPreferences(prefs)}
          onStartAuth={onStartAuth}
          context="landing"
        />
      </div>

      {/* Mobile: sticky bottom bar */}
      <div className="needfinder-mobile-bar">
        <span style={{ fontSize: 13, fontWeight: 600 }}>🎯 Lernpfad personalisieren</span>
        <button onClick={() => setShowMobilePanel(true)} style={{ background: '#fff', color: '#1D9E75', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Starten →
        </button>
      </div>

      {/* Mobile: NeedFinder modal */}
      {showMobilePanel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px 20px 0 0', background: '#fff' }}>
            <div style={{ padding: '12px', textAlign: 'right' }}>
              <button onClick={() => setShowMobilePanel(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
            </div>
            <NeedFinderPanel
              preferences={lpPreferences}
              onComplete={(prefs) => { setLpPreferences(prefs); setShowMobilePanel(false) }}
              onStartAuth={() => { setShowMobilePanel(false); onStartAuth() }}
              context="landing"
            />
          </div>
        </div>
      )}
    </div>
  )
```

- [ ] **Step 5: Verify build passes**

```bash
cd /workspaces/Lernplattform && npm run build 2>&1 | tail -5
```

Expected: `✓ built in` with no errors.

- [ ] **Step 6: Verify visually**

Run `npm run dev`, open the app, confirm:
- Desktop: landing page shows narrow Need Finder panel on the right (280px), landing content fills remaining width
- Mobile (DevTools < 768px): right panel hidden, sticky green bottom bar visible, tapping "Starten →" opens bottom sheet modal

- [ ] **Step 7: Commit**

```bash
git add src/components/LandingPage.jsx
git commit -m "feat: add NeedFinderPanel right column to landing page with mobile modal"
```

---

## Task 4: Auth.jsx — glassmorphism restyle

**Files:**
- Modify: `src/components/Auth.jsx`

Replace the entire `s` styles object and the return JSX with the new glassmorphism design. The logic (handle, mode state, etc.) stays unchanged.

- [ ] **Step 1: Replace the styles object `s` in `src/components/Auth.jsx`**

Replace:
```js
const s = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(135deg, #f0fdf9 0%, #f8f9fa 60%)' },
  card: { background: '#fff', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoIcon: { width: 38, height: 38, background: '#1D9E75', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 600 },
  logoName: { fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' },
  title: { fontSize: 22, fontWeight: 600, marginBottom: 6 },
  sub: { fontSize: 14, color: '#6B7280', marginBottom: 28 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: '#374151' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid rgba(0,0,0,0.14)', borderRadius: 8, fontSize: 14, outline: 'none', transition: 'border-color .15s', marginBottom: 16 },
  btn: { width: '100%', padding: '11px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'background .15s' },
  toggle: { textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6B7280' },
  toggleLink: { color: '#1D9E75', cursor: 'pointer', fontWeight: 500 },
  error: { background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
  success: { background: '#E1F5EE', color: '#085041', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
}
```

With:
```js
const s = {
  wrap: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px', background: 'linear-gradient(135deg, #064E3B 0%, #1D9E75 100%)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20,
    padding: '40px 36px', width: '100%', maxWidth: 400,
    boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoIcon: {
    width: 38, height: 38, background: 'rgba(255,255,255,0.2)', borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 18, fontWeight: 700, border: '1px solid rgba(255,255,255,0.3)',
  },
  logoName: { fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 6, color: '#fff' },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 28 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: 'rgba(255,255,255,0.85)' },
  input: {
    width: '100%', padding: '11px 14px',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, fontSize: 14,
    outline: 'none', marginBottom: 16, boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.15)', color: '#fff',
    fontFamily: 'inherit',
  },
  btn: {
    width: '100%', padding: '12px', background: '#fff', color: '#064E3B',
    border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
    cursor: 'pointer', transition: 'opacity .15s', fontFamily: 'inherit',
  },
  toggle: { textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  toggleLink: { color: '#A7F3D0', cursor: 'pointer', fontWeight: 600 },
  error: {
    background: 'rgba(254,226,226,0.15)', color: '#FCA5A5',
    border: '1px solid rgba(252,165,165,0.3)',
    padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16,
  },
  success: {
    background: 'rgba(209,250,229,0.15)', color: '#A7F3D0',
    border: '1px solid rgba(167,243,208,0.3)',
    padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16,
  },
}
```

- [ ] **Step 2: Update the "← Zur Startseite" back button style**

Find:
```jsx
<button onClick={onBack} style={{ position: 'fixed', top: 20, left: 24, background: 'rgba(6,40,30,0.08)', border: 'none', color: '#065F46', fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: '8px 16px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
  ← Zur Startseite
</button>
```

Replace with:
```jsx
<button onClick={onBack} style={{ position: 'fixed', top: 20, left: 24, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: '8px 16px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(4px)' }}>
  ← Zur Startseite
</button>
```

- [ ] **Step 3: Add placeholder color CSS for the inputs**

In `Auth.jsx`, add a `<style>` tag just before the card div. Inside the wrap `<div>`:

Find:
```jsx
    <div style={s.card}>
```

Insert immediately before it:
```jsx
      <style>{`
        input::placeholder { color: rgba(255,255,255,0.45); }
        input { caret-color: #fff; }
        @media (max-width: 480px) {
          div[style*="maxWidth: 400"] { padding: 32px 24px !important; }
        }
      `}</style>
```

- [ ] **Step 4: Verify build passes**

```bash
cd /workspaces/Lernplattform && npm run build 2>&1 | tail -5
```

Expected: `✓ built in` with no errors.

- [ ] **Step 5: Verify visually**

Run `npm run dev`, click "Jetzt kostenlos starten →" on landing page. Confirm:
- Auth page has green gradient background
- Card has glassmorphism (blurred/translucent)
- Inputs have white text and rgba background
- "← Zur Startseite" button is visible and ghost-styled
- Mobile: card fills 90% width, inputs are readable

- [ ] **Step 6: Commit**

```bash
git add src/components/Auth.jsx
git commit -m "feat: restyle Auth page with glassmorphism to match landing page"
```

---

## Task 5: App.jsx + Home.jsx — dashboard panel, remove old NeedFinder

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Home.jsx`
- Delete: `src/components/NeedFinder.jsx`

- [ ] **Step 1: Update imports in `src/App.jsx`**

Replace:
```js
import NeedFinder from './components/NeedFinder'
```

With:
```js
import NeedFinderPanel from './components/NeedFinderPanel'
```

- [ ] **Step 2: Remove `showNeedFinder` state from `src/App.jsx`**

Remove this line:
```js
  const [showNeedFinder, setShowNeedFinder] = useState(false)
```

- [ ] **Step 3: Remove the `useEffect` that triggers NeedFinder in `src/App.jsx`**

Remove the entire block:
```js
  useEffect(() => {
    if (session && !localStorage.getItem('learnhub_onboarding_done')) {
      setShowNeedFinder(true)
    }
  }, [session])
```

- [ ] **Step 4: Update the `preferences` state initial value in `src/App.jsx`**

The preferences format now includes `job` and `jobAreas`. The existing localStorage read handles this automatically (JSON.parse will include any stored fields). No change needed to the state initialization line — it reads whatever is in localStorage.

- [ ] **Step 5: Replace the logged-in layout in `src/App.jsx`**

Find:
```jsx
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        view={view} setView={setView}
        selectedArea={selectedArea} setSelectedArea={setSelectedArea}
        user={session.user}
        progress={areaProgress}
        stats={stats}
      />
      <main style={{ flex: 1, overflowY: 'auto', background: '#F8F9FA', display: 'flex', flexDirection: 'column' }}>
        <Header stats={stats} />
        <div style={{ flex: 1 }}>
```

Replace just the outer wrapper and add the right panel. The full logged-in return becomes:

```jsx
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        view={view} setView={setView}
        selectedArea={selectedArea} setSelectedArea={setSelectedArea}
        user={session.user}
        progress={areaProgress}
        stats={stats}
      />
      <main style={{ flex: 1, overflowY: 'auto', background: '#F8F9FA', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header stats={stats} />
        <div style={{ flex: 1 }}>
          {view === 'home' && (
            <Home
              setView={setView}
              setSelectedArea={setSelectedArea}
              setSelectedLevel={setSelectedLevel}
              progress={areaProgress}
              preferences={preferences}
            />
          )}
          {view === 'topics' && selectedArea && (
            <TopicList
              area={selectedArea}
              topics={currentAreaTopics}
              progress={progress}
              onSelect={(topic) => { setSelectedTopic(topic); setView('learn') }}
            />
          )}
          {view === 'learn' && selectedTopic && selectedArea && (
            <Learn
              topic={selectedTopic}
              area={selectedArea}
              userId={session.user.id}
              onBack={() => setView('topics')}
              onStartQuiz={() => setView('quiz')}
              onLearned={(topicId) => {
                setProgress(p => ({ ...p, [topicId]: { ...p[topicId], learned: true, last_studied: new Date().toISOString() } }))
                awardXp('learned', 0, 1, stats, areaProgress)
              }}
            />
          )}
          {view === 'quiz' && selectedTopic && selectedArea && (
            <Quiz
              topic={selectedTopic}
              area={selectedArea}
              userId={session.user.id}
              onBack={() => setView('learn')}
              onDone={() => setView('topics')}
              onScoreSaved={(topicId, score, total) => {
                setProgress(p => ({ ...p, [topicId]: { ...p[topicId], quiz_score: score, quiz_total: total, attempts: (p[topicId]?.attempts || 0) + 1 } }))
                awardXp('quiz', score, total, stats, areaProgress)
              }}
            />
          )}
          {view === 'progress' && (
            <Progress
              progress={progress}
              topics={topics}
              setSelectedArea={setSelectedArea}
              setSelectedTopic={setSelectedTopic}
              setView={setView}
            />
          )}
        </div>
      </main>
      <NeedFinderPanel
        preferences={preferences}
        onComplete={(prefs) => setPreferences(prefs)}
        onStartAuth={null}
        context="dashboard"
      />
    </div>
  )
```

- [ ] **Step 6: Update `src/components/Home.jsx` to use `jobAreas` for recommendations**

Replace:
```js
  const recommendedIds = preferences?.goal ? (GOAL_AREAS[preferences.goal] || []) : []
```

With:
```js
  const recommendedIds = preferences?.jobAreas?.length > 0
    ? preferences.jobAreas
    : (preferences?.goal ? (GOAL_AREAS[preferences.goal] || []) : [])
```

- [ ] **Step 7: Delete `src/components/NeedFinder.jsx`**

```bash
rm /workspaces/Lernplattform/src/components/NeedFinder.jsx
```

- [ ] **Step 8: Verify build passes**

```bash
cd /workspaces/Lernplattform && npm run build 2>&1 | tail -5
```

Expected: `✓ built in` with no errors. No references to NeedFinder should remain.

- [ ] **Step 9: Verify no remaining NeedFinder imports**

```bash
grep -r "NeedFinder" /workspaces/Lernplattform/src/
```

Expected: only `NeedFinderPanel` results, no `NeedFinder` (without Panel).

- [ ] **Step 10: Verify visually**

Run `npm run dev`, log in, confirm:
- Dashboard shows "Mein Profil" panel on the right (280px)
- Panel shows profile summary if preferences exist, or the 3-step flow if not
- "✏️ Ändern" opens the edit flow inline
- "⭐ Empfohlen für dich" in Home uses job-based areas when jobAreas is set

- [ ] **Step 11: Commit and push**

```bash
git add src/App.jsx src/components/Home.jsx
git rm src/components/NeedFinder.jsx
git commit -m "feat: add NeedFinderPanel to dashboard, remove old NeedFinder modal, update recommendations"
git push
```

---

## Self-Review

**Spec coverage:**
- ✅ Landing page right panel (280px, sticky) — Task 3
- ✅ Freitext job input + AI mapping (debounced 500ms) — Task 1 + Task 2
- ✅ 3-step flow: Beruf, Ziel, Niveau — Task 2
- ✅ Live recommendation updates — Task 2 (jobAreas updates via useEffect)
- ✅ "Jetzt starten →" → Auth — Task 2 (`onStartAuth` prop)
- ✅ Preferences saved to localStorage `learnhub_preferences` — Task 2
- ✅ Auth page glassmorphism restyle — Task 4
- ✅ Auth page mobile optimized — Task 4
- ✅ Dashboard "Mein Profil" panel — Task 5
- ✅ "✏️ Ändern" re-runs flow inline — Task 2 (editing state)
- ✅ Home.jsx uses jobAreas for recommendations — Task 5
- ✅ Old NeedFinder.jsx deleted — Task 5
- ✅ Mobile: sticky bottom bar + modal — Task 3

**Type/signature consistency:**
- `mapJobToAreas(job: string): Promise<string[]>` — defined Task 1, used Task 2 ✅
- `NeedFinderPanel({ preferences, onComplete, onStartAuth, context })` — defined Task 2, used Task 3 and Task 5 ✅
- `preferences: { job, jobAreas, goal, level }` — written Task 2, read Task 5 (Home.jsx) ✅
- `onComplete(prefs)` called with full prefs object in Task 2, received in Task 3 and Task 5 ✅
