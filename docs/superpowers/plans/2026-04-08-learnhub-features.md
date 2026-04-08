# LearnHub Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public landing page, gamification (XP/levels/streaks/badges/confetti), an onboarding Need Finder, and Supabase-cached AI content to the LearnHub React + Vite + Supabase app.

**Architecture:** No react-router — App.jsx uses a `showLanding` boolean state to render LandingPage before Auth. Gamification state lives in a `user_stats` Supabase table and is loaded alongside session. Need Finder is a localStorage-gated modal that runs once after first login. AI caching adds a `content_cache` Supabase table queried before every Claude API call.

**Tech Stack:** React 18, Vite, Supabase JS v2, canvas-confetti (new), CSS parallax (background-attachment: fixed)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/components/LandingPage.jsx` | **Create** | Public landing page (hero, areas, features, testimonials) |
| `src/components/Header.jsx` | **Create** | XP bar, level badge, streak display shown inside the app |
| `src/components/NeedFinder.jsx` | **Create** | 3-step onboarding modal |
| `src/lib/gamification.js` | **Create** | Pure XP/level/badge logic (no side effects) |
| `src/App.jsx` | **Modify** | showLanding state, stats state, XP callbacks, NeedFinder gate |
| `src/components/Learn.jsx` | **Modify** | Cache-aware content, XP on learned |
| `src/components/Quiz.jsx` | **Modify** | Cache-aware quiz, confetti, XP on done |
| `src/components/Home.jsx` | **Modify** | Recommendations section from NeedFinder prefs |
| `src/components/Sidebar.jsx` | **Modify** | XP mini-display in user footer |
| `src/lib/claude.js` | **Modify** | Caching layer, env var for API key |
| `.env.example` | **Create** | Document VITE_ANTHROPIC_API_KEY |

---

## Task 1 — Supabase: Create user_stats and content_cache tables

**Files:**
- No code files — run SQL via Supabase dashboard or CLI

- [ ] **Step 1: Open Supabase SQL Editor**

Go to your Supabase project → SQL Editor → New query. Run:

```sql
-- user_stats: one row per user, tracks XP, level, streak, badges
CREATE TABLE IF NOT EXISTS user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  streak integer NOT NULL DEFAULT 0,
  last_studied_date date,
  badges jsonb NOT NULL DEFAULT '[]'
);

-- RLS: users can only read/write their own stats
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own stats" ON user_stats
  FOR ALL USING (auth.uid() = user_id);

-- content_cache: cached AI content keyed by topic+level+type
CREATE TABLE IF NOT EXISTS content_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL,
  level text NOT NULL,
  type text NOT NULL CHECK (type IN ('content', 'quiz')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(topic_id, level, type)
);

-- RLS: all authenticated users can read; insert for all authenticated
ALTER TABLE content_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read cache" ON content_cache
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated insert cache" ON content_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

- [ ] **Step 2: Verify tables exist**

In Supabase Table Editor, confirm both `user_stats` and `content_cache` appear with the correct columns.

---

## Task 2 — Landing Page: LandingPage.jsx

**Files:**
- Create: `src/components/LandingPage.jsx`
- Modify: `src/App.jsx` (add showLanding state + render LandingPage)

- [ ] **Step 1: Create LandingPage.jsx**

Create `src/components/LandingPage.jsx` with the full content:

```jsx
import { useEffect, useRef } from 'react'
import { AREAS } from './Sidebar'

const FEATURES = [
  { icon: '🤖', title: 'KI-Lerninhalte', desc: 'Personalisiert für dein Level und Fachbereich' },
  { icon: '🇨🇭', title: 'Schweizer Kontext', desc: 'Praxisbeispiele aus dem Schweizer Berufsalltag' },
  { icon: '🎮', title: 'Gamification', desc: 'XP sammeln, Level aufsteigen, Badges gewinnen' },
]

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'HR Business Partner', text: 'Endlich eine Plattform, die mir genau das erklärt, was ich für meinen Job brauche – ohne stundenlange Videos.' },
  { name: 'Marco B.', role: 'ICT Projektleiter', text: 'Die KI-Inhalte sind erstaunlich präzise. Ich lerne täglich 20 Minuten und merke echten Fortschritt.' },
  { name: 'Lea M.', role: 'Marketing Managerin', text: 'Das Quiz-System hilft mir, wirklich zu überprüfen ob ich den Stoff verstanden habe. Super Konzept!' },
]

export default function LandingPage({ onStartAuth }) {
  const handleThemen = (e) => {
    e.preventDefault()
    document.getElementById('fachbereiche')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111827', overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-fade { animation: fadeUp .6s ease both; }
        .lp-fade-2 { animation: fadeUp .6s .15s ease both; }
        .lp-fade-3 { animation: fadeUp .6s .3s ease both; }
        .area-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.18) !important; }
        .area-card { transition: transform .2s, box-shadow .2s; }
        .cta-btn:hover { opacity: .9; transform: translateY(-1px); }
        .cta-btn { transition: opacity .15s, transform .15s; }
        @media (max-width: 640px) {
          .hero-btns { flex-direction: column !important; }
          .areas-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .navbar-cta-text { display: none; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,40,30,0.97)', backdropFilter: 'blur(8px)',
        padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: '#1D9E75', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>L</div>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em' }}>LearnHub</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onStartAuth} className="navbar-cta-text" style={{ background: 'none', border: 'none', color: '#A7F3D0', fontSize: 14, cursor: 'pointer', padding: '6px 12px', borderRadius: 8 }}>Anmelden</button>
          <button onClick={onStartAuth} className="cta-btn" style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Kostenlos starten</button>
        </div>
      </nav>

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
          Lerne in 8 Fachbereichen mit KI-generierten Inhalten — persönlich zugeschnitten auf dein Niveau und deine Ziele.
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
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, marginBottom: 40 }}>Klicke auf einen Bereich um zu starten</p>

          <div className="areas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))', gap: 16, maxWidth: 720, margin: '0 auto' }}>
            {AREAS.map(a => (
              <button key={a.id} onClick={onStartAuth} className="area-card" style={{
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
  )
}
```

- [ ] **Step 2: Wire LandingPage into App.jsx**

Replace the relevant section of `src/App.jsx`. The full updated file:

```jsx
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import LandingPage from './components/LandingPage'
import Sidebar, { AREAS } from './components/Sidebar'
import Home from './components/Home'
import TopicList from './components/TopicList'
import Learn from './components/Learn'
import Quiz from './components/Quiz'
import Progress from './components/Progress'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLanding, setShowLanding] = useState(true)
  const [view, setView] = useState('home')
  const [selectedArea, setSelectedArea] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [topics, setTopics] = useState({})
  const [progress, setProgress] = useState({})

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      loadTopics()
      loadProgress()
    }
  }, [session])

  const loadTopics = async () => {
    const { data } = await supabase.from('topics').select('*').order('sort_order')
    if (!data) return
    const grouped = {}
    AREAS.forEach(a => { grouped[a.id] = data.filter(t => t.area_id === a.id) })
    setTopics(grouped)
  }

  const loadProgress = async () => {
    const { data } = await supabase.from('user_progress').select('*').eq('user_id', session.user.id)
    if (!data) return
    const map = {}
    data.forEach(p => { map[p.topic_id] = p })
    setProgress(map)
  }

  const areaProgress = {}
  AREAS.forEach(a => {
    areaProgress[a.id] = {}
    ;(topics[a.id] || []).forEach(t => {
      if (progress[t.id]) areaProgress[a.id][t.id] = progress[t.id]
    })
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #E5E7EB', borderTopColor: '#1D9E75', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  // Not logged in: show landing or auth
  if (!session) {
    if (showLanding) return <LandingPage onStartAuth={() => setShowLanding(false)} />
    return <Auth />
  }

  const currentAreaTopics = selectedArea ? (topics[selectedArea.id] || []) : []

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        view={view} setView={setView}
        selectedArea={selectedArea} setSelectedArea={setSelectedArea}
        user={session.user}
        progress={areaProgress}
      />
      <main style={{ flex: 1, overflowY: 'auto', background: '#F8F9FA' }}>
        {view === 'home' && (
          <Home
            setView={setView}
            setSelectedArea={setSelectedArea}
            setSelectedLevel={setSelectedLevel}
            progress={areaProgress}
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
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Run dev server and verify**

```bash
npm run dev
```

Open http://localhost:5173. Confirm:
- Landing page shows (not the auth form)
- "Kostenlos starten" button shows Auth form
- "Themen entdecken" scrolls to the Fachbereiche section
- Clicking an area card also opens Auth form
- Parallax effect visible when scrolling on desktop

- [ ] **Step 4: Commit and push**

```bash
git add src/components/LandingPage.jsx src/App.jsx
git commit -m "feat: add public landing page with parallax hero"
git push
```

---

## Task 3 — Gamification: gamification.js utility

**Files:**
- Create: `src/lib/gamification.js`

- [ ] **Step 1: Create gamification.js**

```js
// src/lib/gamification.js
// Pure functions — no Supabase calls, no side effects.

export const LEVELS = [
  { level: 1, name: 'Einsteiger',       minXp: 0 },
  { level: 2, name: 'Lernender',        minXp: 100 },
  { level: 3, name: 'Fortgeschrittener',minXp: 300 },
  { level: 4, name: 'Experte',          minXp: 600 },
  { level: 5, name: 'Meister',          minXp: 1000 },
]

export const BADGES = [
  { id: 'first_step',   label: 'Erster Schritt', icon: '🌱', desc: 'Erstes Thema gelernt' },
  { id: 'quiz_master',  label: 'Quiz-Meister',   icon: '🏆', desc: '5 Quizze mit 100% bestanden' },
  { id: 'allrounder',   label: 'Allrounder',     icon: '🌍', desc: 'Alle 8 Fachbereiche angetastet' },
  { id: 'streak_7',     label: 'Streak-7',       icon: '🔥', desc: '7 Tage in Folge gelernt' },
]

// Returns the current level object for a given XP amount
export function getLevel(xp) {
  return [...LEVELS].reverse().find(l => xp >= l.minXp) || LEVELS[0]
}

// Returns progress 0–1 within the current level band
export function getLevelProgress(xp) {
  const current = getLevel(xp)
  const next = LEVELS.find(l => l.level === current.level + 1)
  if (!next) return 1
  return (xp - current.minXp) / (next.minXp - current.minXp)
}

// XP to award for an action
export function xpForAction(action, score, total) {
  if (action === 'learned') return 10
  if (action === 'quiz') {
    const base = 20
    const bonus = (score === total) ? 50 : 0
    return base + bonus
  }
  return 0
}

// Given current badges array and stats, return array of newly earned badge IDs
export function checkNewBadges(currentBadges, { learnedCount, perfectQuizCount, touchedAreas, streak }) {
  const earned = new Set(currentBadges)
  const newBadges = []
  if (!earned.has('first_step') && learnedCount >= 1) newBadges.push('first_step')
  if (!earned.has('quiz_master') && perfectQuizCount >= 5) newBadges.push('quiz_master')
  if (!earned.has('allrounder') && touchedAreas >= 8) newBadges.push('allrounder')
  if (!earned.has('streak_7') && streak >= 7) newBadges.push('streak_7')
  return newBadges
}
```

---

## Task 4 — Gamification: user_stats loading + XP save helper

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add stats state and loadStats to App.jsx**

Add after the `progress` state declaration and `loadProgress` function:

```jsx
const [stats, setStats] = useState({ xp: 0, level: 1, streak: 0, last_studied_date: null, badges: [] })

const loadStats = async () => {
  const { data } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', session.user.id)
    .single()
  if (data) setStats(data)
}
```

- [ ] **Step 2: Call loadStats inside the session useEffect**

```jsx
useEffect(() => {
  if (session) {
    loadTopics()
    loadProgress()
    loadStats()
  }
}, [session])
```

- [ ] **Step 3: Add awardXp helper to App.jsx**

Add after `loadStats`:

```jsx
const awardXp = async (action, score = 0, total = 1) => {
  const { xpForAction, getLevel, checkNewBadges } = await import('./lib/gamification')
  const gain = xpForAction(action, score, total)
  if (gain === 0) return

  const newXp = stats.xp + gain
  const newLevel = getLevel(newXp).level

  // Streak: increment if last_studied_date is yesterday or null; reset if older
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  let newStreak = stats.streak
  if (stats.last_studied_date !== today) {
    newStreak = stats.last_studied_date === yesterday ? stats.streak + 1 : 1
  }

  // Badge check — we need aggregate progress data
  const learnedCount = Object.values(progress).filter(p => p.learned).length + (action === 'learned' ? 1 : 0)
  const perfectQuizzes = Object.values(progress).filter(p => p.quiz_score != null && p.quiz_score === p.quiz_total).length + (action === 'quiz' && score === total ? 1 : 0)
  const touchedAreas = Object.keys(areaProgress).filter(aId => Object.keys(areaProgress[aId]).length > 0).length
  const newBadgeIds = checkNewBadges(stats.badges, { learnedCount, perfectQuizCount: perfectQuizzes, touchedAreas, streak: newStreak })
  const newBadges = [...stats.badges, ...newBadgeIds]

  const updated = { user_id: session.user.id, xp: newXp, level: newLevel, streak: newStreak, last_studied_date: today, badges: newBadges }
  await supabase.from('user_stats').upsert(updated, { onConflict: 'user_id' })
  setStats({ xp: newXp, level: newLevel, streak: newStreak, last_studied_date: today, badges: newBadges })
}
```

- [ ] **Step 4: Pass awardXp into Learn and Quiz via App.jsx**

In the `view === 'learn'` block, add `onAwardXp={awardXp}`:
```jsx
<Learn
  topic={selectedTopic}
  area={selectedArea}
  userId={session.user.id}
  onBack={() => setView('topics')}
  onStartQuiz={() => setView('quiz')}
  onLearned={(topicId) => {
    setProgress(p => ({ ...p, [topicId]: { ...p[topicId], learned: true, last_studied: new Date().toISOString() } }))
    awardXp('learned')
  }}
/>
```

In the `view === 'quiz'` block, add `onAwardXp={awardXp}`:
```jsx
<Quiz
  topic={selectedTopic}
  area={selectedArea}
  userId={session.user.id}
  onBack={() => setView('learn')}
  onDone={() => setView('topics')}
  onScoreSaved={(topicId, score, total) => {
    setProgress(p => ({ ...p, [topicId]: { ...p[topicId], quiz_score: score, quiz_total: total, attempts: (p[topicId]?.attempts || 0) + 1 } }))
    awardXp('quiz', score, total)
  }}
/>
```

Also pass `stats` to `Sidebar`:
```jsx
<Sidebar
  view={view} setView={setView}
  selectedArea={selectedArea} setSelectedArea={setSelectedArea}
  user={session.user}
  progress={areaProgress}
  stats={stats}
/>
```

---

## Task 5 — Gamification: Header.jsx + Confetti in Quiz

**Files:**
- Create: `src/components/Header.jsx`
- Modify: `src/components/Quiz.jsx`
- Modify: `src/components/Sidebar.jsx`
- Modify: `src/App.jsx` (render Header)
- Modify: `package.json` (add canvas-confetti)

- [ ] **Step 1: Install canvas-confetti**

```bash
npm install canvas-confetti
```

Expected output: added canvas-confetti to node_modules and package.json.

- [ ] **Step 2: Create Header.jsx**

```jsx
// src/components/Header.jsx
import { LEVELS, getLevelProgress } from '../lib/gamification'

export default function Header({ stats }) {
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
      {/* Level badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ background: '#1D9E75', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
          Lv.{level} {levelInfo.name}
        </div>
      </div>

      {/* XP bar */}
      <div style={{ flex: 1, minWidth: 120, maxWidth: 260 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 4 }}>
          <span>{xp} XP</span>
          {nextLevel && <span>→ {nextLevel.minXp} XP</span>}
        </div>
        <div style={{ height: 6, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(progress * 100, 100)}%`, height: '100%', background: '#1D9E75', borderRadius: 4, transition: 'width .4s ease' }} />
        </div>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#F59E0B', fontWeight: 600 }}>
          🔥 {streak} Tag{streak !== 1 ? 'e' : ''}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Add Header to App.jsx main area**

Wrap the `<main>` content in App.jsx — import Header and add it at the top of main:

```jsx
import Header from './components/Header'
```

Inside the return, replace `<main ...>` opening:
```jsx
<main style={{ flex: 1, overflowY: 'auto', background: '#F8F9FA', display: 'flex', flexDirection: 'column' }}>
  <Header stats={stats} />
  <div style={{ flex: 1 }}>
    {/* all the view conditionals go here unchanged */}
  </div>
</main>
```

- [ ] **Step 4: Add XP mini-display to Sidebar.jsx**

In `Sidebar.jsx`, update the function signature to accept `stats`:
```jsx
export default function Sidebar({ view, setView, selectedArea, setSelectedArea, user, progress, stats }) {
```

In the user footer section, add XP display above the sign-out button:
```jsx
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
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    {/* existing avatar + email + signout */}
  </div>
</div>
```

Add the import at the top of Sidebar.jsx:
```jsx
import { getLevelProgress } from '../lib/gamification'
```

- [ ] **Step 5: Add confetti to Quiz.jsx**

At the top of `Quiz.jsx`, add:
```jsx
import confetti from 'canvas-confetti'
```

In the `handleNext` function, after `setDone(true)`, add:
```jsx
setScore(newScore)
setDone(true)
// Confetti if >= 80%
if (newScore / questions.length >= 0.8) {
  confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#1D9E75', '#6EE7B7', '#F59E0B', '#fff'] })
}
```

- [ ] **Step 6: Verify gamification works end-to-end**

```bash
npm run dev
```

Log in, learn a topic → confirm XP increases in Header. Complete a quiz with ≥ 80% → confirm confetti fires. Check Supabase `user_stats` table has a row with correct XP.

- [ ] **Step 7: Commit and push**

```bash
git add src/components/Header.jsx src/lib/gamification.js src/components/Quiz.jsx src/components/Sidebar.jsx src/App.jsx package.json package-lock.json
git commit -m "feat: add gamification (XP, levels, streaks, badges, confetti)"
git push
```

---

## Task 6 — Need Finder: NeedFinder.jsx + Home recommendations

**Files:**
- Create: `src/components/NeedFinder.jsx`
- Modify: `src/components/Home.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create NeedFinder.jsx**

```jsx
// src/components/NeedFinder.jsx
import { useState } from 'react'

const STEPS = [
  {
    question: 'Was ist dein Lernziel?',
    key: 'goal',
    options: [
      { value: 'job_current', label: 'Weiterbildung im aktuellen Job', icon: '💼' },
      { value: 'job_change',  label: 'Jobwechsel vorbereiten',        icon: '🚀' },
      { value: 'refresh',    label: 'Wissen auffrischen',             icon: '🔄' },
      { value: 'exam',       label: 'Prüfungsvorbereitung',           icon: '📝' },
    ],
  },
  {
    question: 'Wie viel Zeit hast du pro Woche?',
    key: 'time',
    options: [
      { value: '30min', label: '30 Minuten',  icon: '⚡' },
      { value: '1h',    label: '1 Stunde',    icon: '🕐' },
      { value: '2h',    label: '2 Stunden',   icon: '🕑' },
      { value: '3h',    label: '3+ Stunden',  icon: '🏋️' },
    ],
  },
  {
    question: 'Auf welchem Level bist du?',
    key: 'level',
    options: [
      { value: 'einsteiger',      label: 'Einsteiger',      icon: '🌱', desc: 'Kein Vorwissen nötig' },
      { value: 'fortgeschrittene',label: 'Fortgeschrittene',icon: '🌿', desc: 'Grundwissen vorhanden' },
      { value: 'experte',         label: 'Experte',         icon: '🌳', desc: 'Tiefes Verständnis' },
    ],
  },
]

export default function NeedFinder({ onDone }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})

  const handleSelect = (value) => {
    const key = STEPS[step].key
    const newAnswers = { ...answers, [key]: value }
    setAnswers(newAnswers)
    if (step + 1 >= STEPS.length) {
      localStorage.setItem('learnhub_preferences', JSON.stringify(newAnswers))
      localStorage.setItem('learnhub_onboarding_done', '1')
      onDone(newAnswers)
    } else {
      setStep(s => s + 1)
    }
  }

  const current = STEPS[step]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16
    }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', maxWidth: 460, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i <= step ? '#1D9E75' : '#E5E7EB', transition: 'all .3s' }} />
          ))}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em', textAlign: 'center' }}>{current.question}</h2>
        <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>Schritt {step + 1} von {STEPS.length}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {current.options.map(opt => (
            <button key={opt.value} onClick={() => handleSelect(opt.value)} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
              border: '2px solid #E5E7EB', borderRadius: 12, cursor: 'pointer',
              background: '#fff', textAlign: 'left', fontFamily: 'inherit',
              transition: 'border-color .15s, background .15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1D9E75'; e.currentTarget.style.background = '#F0FDF9' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#fff' }}
            >
              <span style={{ fontSize: 22 }}>{opt.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{opt.label}</div>
                {opt.desc && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{opt.desc}</div>}
              </div>
            </button>
          ))}
        </div>

        <button onClick={() => { localStorage.setItem('learnhub_onboarding_done', '1'); onDone(null) }}
          style={{ marginTop: 20, width: '100%', background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', padding: 8 }}>
          Überspringen
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add NeedFinder gate to App.jsx**

Add state and import:
```jsx
import NeedFinder from './components/NeedFinder'
```

Add state after other state declarations:
```jsx
const [showNeedFinder, setShowNeedFinder] = useState(false)
const [preferences, setPreferences] = useState(() => {
  try { return JSON.parse(localStorage.getItem('learnhub_preferences') || 'null') } catch { return null }
})
```

Add useEffect to trigger on first login:
```jsx
useEffect(() => {
  if (session && !localStorage.getItem('learnhub_onboarding_done')) {
    setShowNeedFinder(true)
  }
}, [session])
```

Inside the logged-in return, add NeedFinder overlay before `</div>` at the end:
```jsx
{showNeedFinder && (
  <NeedFinder onDone={(prefs) => {
    setShowNeedFinder(false)
    if (prefs) setPreferences(prefs)
  }} />
)}
```

Pass `preferences` to `Home`:
```jsx
<Home
  setView={setView}
  setSelectedArea={setSelectedArea}
  setSelectedLevel={setSelectedLevel}
  progress={areaProgress}
  preferences={preferences}
/>
```

- [ ] **Step 3: Add recommendations to Home.jsx**

Add the recommendation map and section to `Home.jsx`. Update the full file:

```jsx
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
```

- [ ] **Step 4: Verify Need Finder**

```bash
npm run dev
```

Open in incognito (to clear localStorage). Log in → NeedFinder modal appears. Complete steps → Home shows "Empfohlen für dich". Log out and back in → modal does NOT appear again (localStorage gate).

- [ ] **Step 5: Commit and push**

```bash
git add src/components/NeedFinder.jsx src/components/Home.jsx src/App.jsx
git commit -m "feat: add Need Finder onboarding flow and home recommendations"
git push
```

---

## Task 7 — AI Caching: content_cache in claude.js + .env.example

**Files:**
- Modify: `src/lib/claude.js`
- Modify: `src/components/Learn.jsx`
- Modify: `src/components/Quiz.jsx`
- Create: `.env.example`

- [ ] **Step 1: Update claude.js with caching layer**

Replace `src/lib/claude.js` entirely:

```js
import { supabase } from './supabase'

async function callClaude(prompt) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

// Returns cached content or generates + caches it
async function cachedCall(topicId, level, type, generateFn) {
  // 1. Check cache
  const { data: cached } = await supabase
    .from('content_cache')
    .select('content')
    .eq('topic_id', topicId)
    .eq('level', level)
    .eq('type', type)
    .single()

  if (cached) return { text: cached.content, fromCache: true }

  // 2. Generate
  const text = await generateFn()
  if (!text) return { text: null, fromCache: false }

  // 3. Store
  await supabase.from('content_cache').insert({ topic_id: topicId, level, type, content: text })

  return { text, fromCache: false }
}

export async function generateContent(topicId, topicName, areaName, level) {
  const levelMap = {
    einsteiger:      'Einsteiger (kein Vorwissen)',
    fortgeschrittene:'Fortgeschrittene (Grundwissen vorhanden)',
    experte:         'Experte (tiefes Fachverständnis gefragt)'
  }
  return cachedCall(topicId, level, 'content', () =>
    callClaude(`Du bist ein Schweizer Weiterbildungslehrer. Erkläre "${topicName}" im Bereich "${areaName}" für Level: ${levelMap[level]}.

Schreibe einen strukturierten Lerntext auf Deutsch (ca. 280-320 Wörter). Aufbau:
- Einleitung (1-2 Sätze, was ist das Thema?)
- Hauptteil (die 3-4 wichtigsten Konzepte in Fliesstext-Absätzen)
- Praxisbezug (1 konkretes Beispiel aus dem Schweizer Kontext)
- Merksatz am Schluss (kurz, prägnant)

Kein Markdown, keine Sterne, keine Bullet Points. Nur sauberer Fliesstext in Absätzen. Trenne Absätze mit einer Leerzeile.`)
  )
}

export async function generateQuiz(topicId, topicName, areaName, level) {
  const levelMap = { einsteiger: 'Einsteiger', fortgeschrittene: 'Fortgeschrittene', experte: 'Experte' }
  const result = await cachedCall(topicId, level, 'quiz', () =>
    callClaude(`Erstelle 5 Multiple-Choice-Fragen zum Thema "${topicName}" (${areaName}, Level: ${levelMap[level]}).
Antworte NUR mit einem gültigen JSON-Array. Kein Text davor oder danach, keine Backticks.
Format: [{"q":"Frage?","opts":["Option A","Option B","Option C","Option D"],"ans":0,"explain":"Kurze Erklärung (1-2 Sätze) warum die Antwort korrekt ist"}]
"ans" ist der Index (0-3) der richtigen Antwort. Alle Fragen auf Deutsch.`)
  )
  if (!result.text) return null
  try {
    return { questions: JSON.parse(result.text.replace(/```json|```/g, '').trim()), fromCache: result.fromCache }
  } catch {
    return null
  }
}
```

- [ ] **Step 2: Update Learn.jsx to use new generateContent signature**

Replace the `useEffect` and state at the top of `Learn.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { generateContent } from '../lib/claude'
import { supabase } from '../lib/supabase'

export default function Learn({ topic, area, userId, onBack, onStartQuiz, onLearned }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    setLoading(true)
    setGenerating(false)
    generateContent(topic.id, topic.name, area.name, topic.level || 'einsteiger')
      .then(result => {
        if (result && !result.fromCache) setGenerating(false)
        setContent(result?.text || '')
        setLoading(false)
      })

    // Show "generating" hint after 300ms only if still loading (cache miss)
    const timer = setTimeout(() => setGenerating(true), 300)
    return () => clearTimeout(timer)
  }, [topic.id])
```

In the loading state render, show the generating hint:

```jsx
{loading ? (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#6B7280', fontSize: 14 }}>
    <div style={{ width: 20, height: 20, border: '2px solid #E5E7EB', borderTopColor: '#1D9E75', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
    {generating ? 'KI generiert gerade...' : 'Lade Inhalt...'}
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
) : (
```

- [ ] **Step 3: Update Quiz.jsx to use new generateQuiz signature**

Update the `useEffect` in `Quiz.jsx`:

```jsx
useEffect(() => {
  generateQuiz(topic.id, topic.name, area.name, topic.level || 'einsteiger').then(result => {
    if (!result) { setError(true); setLoading(false); return }
    setQuestions(result.questions)
    setLoading(false)
  })
}, [topic.id])
```

Update the loading text to reflect cache vs. generating:

```jsx
if (loading) return (
  <div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 12, color: '#6B7280', fontSize: 14 }}>
    <div style={{ width: 20, height: 20, border: '2px solid #E5E7EB', borderTopColor: '#F59E0B', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
    Quiz wird geladen...
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
)
```

- [ ] **Step 4: Create .env.example**

```bash
# Create .env.example
```

File content for `.env.example`:

```
# Anthropic API Key — benötigt für KI-Inhaltsgenerierung
# Erhältlich unter: https://console.anthropic.com/settings/keys
# Wichtig: Dieser Key ist im Browser-Bundle sichtbar!
# Für Produktion: Claude-Aufrufe in eine Supabase Edge Function auslagern.
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...

# Supabase-Konfiguration
# Werte findest du unter: Supabase Dashboard → Project Settings → API
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

- [ ] **Step 5: Add VITE_ANTHROPIC_API_KEY to local .env**

If you have a `.env` file locally, add:
```
VITE_ANTHROPIC_API_KEY=<your-actual-key>
```

Note: The Supabase URL/key are currently hardcoded in `supabase.js` — leave them there for now unless you want to move them too.

- [ ] **Step 6: Verify caching works**

```bash
npm run dev
```

Open a topic for the first time → see "KI generiert gerade..." spinner. Navigate away and back to the same topic → content loads instantly (no spinner). Check Supabase `content_cache` table → row should exist.

- [ ] **Step 7: Commit and push**

```bash
git add src/lib/claude.js src/components/Learn.jsx src/components/Quiz.jsx .env.example
git commit -m "feat: add Supabase content caching and env var for API key"
git push
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Landing page with hero, areas, features, testimonials — Task 2
- [x] Parallax scroll effect on Fachbereiche — Task 2 (background-attachment: fixed)
- [x] Auth gate on all CTAs — Task 2 (onStartAuth callback)
- [x] XP system (+10 learned, +20 quiz, +50 perfect) — Tasks 3–4
- [x] Level system (5 levels) — Task 3 (gamification.js LEVELS)
- [x] Streak tracking — Task 4 (awardXp in App.jsx)
- [x] Badges (4 badges) — Tasks 3–4 (checkNewBadges + awardXp)
- [x] Confetti at ≥80% — Task 5 (canvas-confetti in Quiz.jsx)
- [x] XP/streak in Header — Task 5 (Header.jsx)
- [x] XP mini-display in Sidebar — Task 5
- [x] NeedFinder 3-step modal — Task 6
- [x] localStorage gate — Task 6 (learnhub_onboarding_done)
- [x] Recommendations on Home — Task 6
- [x] Supabase content caching — Task 7
- [x] "KI generiert gerade..." hint — Task 7
- [x] .env.example with VITE_ANTHROPIC_API_KEY — Task 7
- [x] Mobile responsive — CSS media queries in LandingPage (Task 2), flex-wrap throughout
- [x] Green accent #1D9E75 — used throughout
- [x] Commit + push after each feature — Tasks 2, 5, 6, 7

**Type consistency:**
- `generateContent(topicId, topicName, areaName, level)` — defined Task 7, called Task 7 in Learn.jsx ✓
- `generateQuiz(topicId, topicName, areaName, level)` — defined Task 7, called Task 7 in Quiz.jsx ✓
- `awardXp(action, score, total)` — defined Task 4, used in App.jsx onLearned/onScoreSaved ✓
- `stats` shape `{ xp, level, streak, last_studied_date, badges }` — consistent across Tasks 4, 5 ✓
- `getLevelProgress(xp)` — defined Task 3 (gamification.js), imported in Header.jsx and Sidebar.jsx Task 5 ✓
