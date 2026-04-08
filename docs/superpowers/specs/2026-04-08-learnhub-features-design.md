# LearnHub Feature Design — 2026-04-08

## Overview

Four feature areas for the LearnHub learning platform (React + Vite + Supabase):
1. Public Landing Page
2. Gamification (XP, Levels, Streaks, Badges, Confetti)
3. Need Finder (Onboarding flow + recommendations)
4. AI Content Caching

---

## 1. Landing Page

### Visual Design (approved)
- **Style:** B+C — centered layout with dark green gradient background (`#064E3B → #065F46 → #1D9E75`)
- **Fachbereiche section:** background image (`https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200`) with dark overlay (`rgba(6,40,30,0.72)`), glassmorphism cards
- **Scroll effect:** CSS `background-attachment: fixed` parallax on the Fachbereiche background image. Falls back gracefully on mobile (mobile ignores fixed attachment).

### Routing approach
No react-router added. `App.jsx` gets a new `showLanding` state:
- Default: `true` if no session
- "Jetzt kostenlos starten" → sets `showLanding = false`, shows `<Auth />`
- "Themen entdecken" → scrolls to `#fachbereiche` anchor on the landing page
- Once logged in, `showLanding` is irrelevant (full app renders)

### New component: `src/components/LandingPage.jsx`
Sections (top to bottom):
1. **Navbar** — Logo, "Anmelden" link, "Kostenlos starten" CTA button
2. **Hero** — gradient background, badge pill, headline, subtext, two CTA buttons
3. **Fachbereiche** (`id="fachbereiche"`) — parallax background image, 8 glassmorphism cards
4. **Features / Why LearnHub** — 3-column icons: KI-Lerninhalte, Schweizer Kontext, Gamification
5. **Testimonials** — 2–3 simple quote cards (static, hardcoded)
6. **Footer CTA** — repeat "Jetzt kostenlos starten"

### Auth gate
- "Jetzt kostenlos starten" and "Anmelden" → `onStartAuth()` callback
- Clicking a Fachbereich card on landing page → also triggers `onStartAuth()`

---

## 2. Gamification

### XP Rules
| Action | XP |
|---|---|
| Thema als gelernt markiert | +10 XP |
| Quiz abgeschlossen (beliebig) | +20 XP |
| Quiz mit 100% bestanden (Bonus) | +50 XP |

### Level System
| Level | XP benötigt |
|---|---|
| 1 — Einsteiger | 0 |
| 2 — Lernender | 100 |
| 3 — Fortgeschrittener | 300 |
| 4 — Experte | 600 |
| 5 — Meister | 1000 |

### Streak
- A day counts if `last_studied` date changes to a new calendar day
- Streak stored in Supabase `user_stats` table, computed server-side via upsert

### Badges
| Badge | Condition |
|---|---|
| Erster Schritt | 1. Thema gelernt |
| Quiz-Meister | 5 Quizze mit 100% |
| Allrounder | Mind. 1 Thema in allen 8 Fachbereichen |
| Streak-7 | 7 Tage Streak |

### Confetti
- Library: `canvas-confetti` (npm install canvas-confetti)
- Triggered in `Quiz.jsx` on `done` screen when score >= 80%
- Short burst animation (2 seconds)

### UI changes
- **Header bar** (new `src/components/Header.jsx`): shows XP progress bar + level badge + streak flame
- Header replaces current top padding in the main content area
- Sidebar bottom section gets XP mini-display next to user avatar

### Supabase: new `user_stats` table
```sql
CREATE TABLE user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  streak integer NOT NULL DEFAULT 0,
  last_studied_date date,
  badges jsonb NOT NULL DEFAULT '[]'
);
```

---

## 3. Need Finder

### Flow
- Shown as a modal overlay on first visit (after login), stored completion in `localStorage` key `learnhub_onboarding_done`
- 3 steps, one question per screen with progress dots

**Step 1 — Ziel**
- Weiterbildung im aktuellen Job
- Jobwechsel vorbereiten
- Wissen auffrischen
- Prüfungsvorbereitung

**Step 2 — Zeit pro Woche**
- 30 Minuten
- 1 Stunde
- 2 Stunden
- 3+ Stunden

**Step 3 — Level**
- Einsteiger (kein Vorwissen)
- Fortgeschrittene (Grundwissen)
- Experte (tiefes Verständnis)

### Recommendations logic (client-side, simple)
After onboarding, the Home dashboard shows a "Empfohlen für dich" section:
- Maps goal → recommended area IDs (e.g. Jobwechsel → ICT, Marketing, HR)
- Maps level → filters topics by `topic.level`
- Saved to `localStorage` as `learnhub_preferences`

### New component: `src/components/NeedFinder.jsx`
Modal with animated step transitions. "Überspringen" button available on all steps.

---

## 4. AI Content Caching

### Problem
`Learn.jsx` and `Quiz.jsx` call Claude API on every load — expensive and slow.

### Solution
New Supabase table `content_cache`:
```sql
CREATE TABLE content_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL,
  level text NOT NULL,
  type text NOT NULL CHECK (type IN ('content','quiz')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(topic_id, level, type)
);
```

### Cache flow (in `claude.js`)
1. Before calling Claude: `SELECT content FROM content_cache WHERE topic_id=? AND level=? AND type=?`
2. If found → return cached content immediately (no API call)
3. If not found → call Claude API, then `INSERT INTO content_cache`
4. Update `generateContent()` and `generateQuiz()` to accept `topicId` parameter

### Loading state
- When cache miss: show "KI generiert gerade..." spinner (already exists in Learn.jsx)
- When cache hit: content appears instantly, no spinner

### .env.example
```
# Anthropic API Key — benötigt für KI-Inhaltsgenerierung
# Erhältlich unter: https://console.anthropic.com/settings/keys
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

Note: The API key is currently hardcoded in `claude.js` headers. It should be moved to `import.meta.env.VITE_ANTHROPIC_API_KEY`. Security caveat: this is still a frontend app — the key is exposed in the browser bundle. For production, move Claude calls to a Supabase Edge Function.

---

## Architecture Summary

### New files
- `src/components/LandingPage.jsx`
- `src/components/NeedFinder.jsx`
- `src/components/Header.jsx`
- `.env.example`

### Modified files
- `src/App.jsx` — landing/auth routing, XP callbacks, stats state, NeedFinder integration
- `src/components/Learn.jsx` — cache-aware content loading, XP on learned
- `src/components/Quiz.jsx` — cache-aware quiz loading, confetti, XP on completion
- `src/components/Home.jsx` — NeedFinder recommendations section
- `src/components/Sidebar.jsx` — XP mini-display
- `src/lib/claude.js` — caching layer, env var for API key
- `package.json` — add `canvas-confetti`

### Supabase migrations (2 new tables)
- `user_stats` — XP, level, streak, badges per user
- `content_cache` — cached AI-generated content and quizzes

### Commit strategy (as requested)
1. Landing Page → commit + push
2. Gamification → commit + push
3. Need Finder → commit + push
4. AI Caching + .env.example → commit + push
