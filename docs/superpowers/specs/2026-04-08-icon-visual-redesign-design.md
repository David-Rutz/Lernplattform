# Icon & Visual Identity Redesign — Design Spec

## Overview

Replace all emoji usage throughout LearnHub with a modern, photo-based and SVG-icon visual system. The platform currently uses emojis everywhere: navigation (🏠📈), Fachbereiche (💻📢📊), gamification (🔥⭐🌱🌿🌳), NeedFinder steps, badges, and feature lists.

**Goal:** Zero emojis. Every visual element uses either Unsplash photos with color overlays, inline SVG icons, or CSS shapes.

---

## 1. Fachbereiche — Photo + Color System

Each of the 8 Fachbereiche gets a unique color and an Unsplash photo. This system is used across three surfaces: landing page cards, sidebar navigation, and home dashboard cards.

### Color Palette

| Bereich | ID | Color | Hex | Unsplash Photo ID |
|---|---|---|---|---|
| ICT & Informatik | `ict` | Emerald | `#059669` | `photo-1517694712202-14dd9538aa97` |
| Marketing | `marketing` | Pink | `#db2777` | `photo-1560472354-b33ff0c44a43` |
| Finanzen | `finanzen` | Amber | `#d97706` | `photo-1611974789855-9c2a0a7236a3` |
| Management | `management` | Indigo | `#6366f1` | `photo-1552664730-d307ca884978` |
| Personal (HR) | `hr` | Cyan | `#0891b2` | `photo-1521737711867-e3b97375f902` |
| Recht | `recht` | Stone | `#57534e` | `photo-1589829545856-d10d557cf95f` |
| Verkauf | `verkauf` | Orange | `#ea580c` | `photo-1600880292203-757bb62b4baf` |
| Volkswirtschaft | `vwl` | Blue | `#2563eb` | `photo-1486325212027-8081e485255e` |

Photo URL pattern: `https://images.unsplash.com/{photo-id}?w={width}&q=80`

### AREAS Array (updated)

```js
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
```

The `icon` field is removed entirely. No component should reference `a.icon` after this change.

---

## 2. Sidebar — Mini Foto-Chip

Fachbereiche entries in the sidebar use a 28×22px photo thumbnail with a color overlay, replacing the emoji icon. Main navigation items (Übersicht, Mein Fortschritt) use inline SVG icons.

### NavItem for Fachbereiche

```jsx
// Mini foto-chip: 28×22px rounded thumbnail with color overlay
function AreaChip({ area, active }) {
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
```

### NavItem for Main Navigation

Home and Fortschritt use simple SVG line icons (no external library — inline SVG):

```jsx
// Home icon (house outline)
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

// Progress icon (bar chart)
const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)
```

### Sidebar Bottom Buttons

Replace `🌐 Website` and `Abmelden` text with clean labels (no emojis):
- Website button: `← Website` (arrow character, not emoji)
- Logout button: `Abmelden` (text only, already has red styling)

---

## 3. Home Dashboard — Photo Area Cards

### Recommended Areas Section

Replace `⭐ Empfohlen für dich` heading with a text label. Replace area cards (currently showing `a.icon` at 28px) with photo cards matching the landing page style but adapted for the light dashboard background:

```jsx
// Recommended card — dark gradient photo style
<button style={{
  position: 'relative', borderRadius: 14, overflow: 'hidden',
  aspectRatio: '3/4', cursor: 'pointer', border: 'none', padding: 0,
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
}}>
  <img src={`https://images.unsplash.com/${a.photo}?w=300&q=80`}
    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  <div style={{ position: 'absolute', inset: 0,
    background: `linear-gradient(160deg, ${a.color}66 0%, ${a.color}dd 100%)` }} />
  <div style={{ position: 'absolute', inset: 0, padding: 14,
    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
    <div style={{ color: '#fff', fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>{a.name}</div>
    {done > 0 && <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 3 }}>{done} gelernt</div>}
  </div>
</button>
```

Grid: `repeat(auto-fill, minmax(140px, 1fr))` for 3/4 aspect cards.

### All Areas Grid

Same photo card style but slightly larger. Replace `a.icon` references. Grid: `repeat(auto-fill, minmax(180px, 1fr))`.

---

## 4. Header — SVG Rings for Gamification

Replace `🔥 {streak} Tage` with an SVG ring indicator. Replace `🎯 Mein Profil` with a target SVG icon.

### Streak Ring

```jsx
// SVG ring showing streak progress (out of 7 days)
function StreakRing({ streak }) {
  const filled = Math.min(streak, 7)
  const circumference = 2 * Math.PI * 10 // r=10
  const offset = circumference * (1 - filled / 7)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <svg width="28" height="28" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="14" cy="14" r="10" fill="none" stroke="rgba(217,119,6,0.15)" strokeWidth="3"/>
        <circle cx="14" cy="14" r="10" fill="none" stroke="#d97706" strokeWidth="3"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"/>
      </svg>
      <span style={{ color: '#d97706', fontSize: 12, fontWeight: 700 }}>{streak}d</span>
    </div>
  )
}
```

Only show if `streak > 0`.

### Profile Toggle Button

Replace `🎯 Mein Profil` with a target/crosshair SVG icon:

```jsx
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
  <circle cx="12" cy="12" r="10"/>
  <circle cx="12" cy="12" r="3"/>
  <line x1="12" y1="2" x2="12" y2="5"/>
  <line x1="12" y1="19" x2="12" y2="22"/>
  <line x1="2" y1="12" x2="5" y2="12"/>
  <line x1="19" y1="12" x2="22" y2="12"/>
</svg>
Mein Profil
```

---

## 5. NeedFinderPanel — Step Indicators & Option Icons

### Step Indicator (Numbered Dots)

Replace `①②③` text labels with a proper step indicator: numbered circles connected by a line. Done steps show a checkmark. Active step has a glow ring.

```jsx
function StepIndicator({ currentStep }) {
  // currentStep: 1, 2, or 3
  const steps = ['Beruf', 'Ziel', 'Niveau']
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
      {steps.map((label, i) => {
        const num = i + 1
        const done = num < currentStep
        const active = num === currentStep
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: done || active ? '#059669' : 'rgba(255,255,255,0.06)',
                border: active ? '2px solid #34D399' : 'none',
                boxShadow: active ? '0 0 0 3px rgba(5,150,105,0.2)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {done ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <span style={{ color: active ? '#fff' : '#4B5563', fontSize: 10, fontWeight: 800 }}>{num}</span>
                )}
              </div>
              <span style={{ fontSize: 8, fontWeight: 600, color: active ? '#34D399' : done ? '#6EE7B7' : '#4B5563', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: num < currentStep ? '#059669' : 'rgba(255,255,255,0.1)', margin: '0 4px', marginBottom: 14 }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
```

The panel shows all 3 steps at once (not a wizard), so `currentStep` is derived from completion state: step 1 is always active (has input), step 2 activates when job is set, step 3 when goal is set.

### GOAL_OPTIONS — Remove Emoji Icons

```js
const GOAL_OPTIONS = [
  { value: 'job_current', label: 'Weiterbildung im aktuellen Job' },
  { value: 'job_change',  label: 'Jobwechsel vorbereiten' },
  { value: 'exam',        label: 'Prüfung / Zertifikat ablegen' },
  { value: 'general',     label: 'Allgemeinwissen aufbauen' },
]
```

Option buttons show only text + checkmark (no icon field rendered).

### LEVEL_OPTIONS — Replace Emoji with Colored Dots

```js
const LEVEL_OPTIONS = [
  { value: 'einsteiger',       label: 'Einsteiger',        color: '#059669' },
  { value: 'fortgeschrittene', label: 'Fortgeschrittener', color: '#d97706' },
  { value: 'experte',          label: 'Experte',           color: '#6366f1' },
]
```

Each option button shows a small colored dot instead of emoji:
```jsx
<div style={{ width: 8, height: 8, borderRadius: '50%', background: o.color, flexShrink: 0 }} />
```

### Panel Header & Profile View

- Replace `🎯` in panel header with the crosshair SVG (same as Header button)
- Replace `✏️ Ändern` with text `Ändern` (styled as underline link or button)
- Replace `💼` job display with a person SVG icon or just the text label
- Replace area arrows `→ {a.icon} {a.name}` with the mini AreaChip component (imported from Sidebar or inlined)
- Replace `⭐ EMPFOHLEN` badge with text label styled with colored left border

---

## 6. Gamification — BADGES without Emojis

### gamification.js Updates

Replace emoji `icon` fields with string IDs that components use to render SVG:

```js
export const BADGES = [
  { id: 'first_step',  label: 'Erster Schritt', iconId: 'check-circle', desc: 'Erstes Thema gelernt' },
  { id: 'quiz_master', label: 'Quiz-Meister',   iconId: 'star',         desc: '5 Quizze mit 100% bestanden' },
  { id: 'allrounder',  label: 'Allrounder',     iconId: 'globe',        desc: 'Alle 8 Fachbereiche angetastet' },
  { id: 'streak_7',    label: 'Streak-7',       iconId: 'flame',        desc: '7 Tage in Folge gelernt' },
]
```

### BadgeIcon component (in Progress.jsx)

```jsx
function BadgeIcon({ iconId, color, size = 16 }) {
  const icons = {
    'check-circle': <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>,
    'star': <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    'globe': <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>,
    'flame': <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[iconId]}
    </svg>
  )
}
```

---

## 7. LandingPage — Emoji Cleanup

### Fachbereiche Grid (already photo-based)

The area cards already use the photo overlay approach from the brainstorm. Confirm no `a.icon` references remain.

### Features Section

Replace emoji icons in FEATURES with inline SVG:
```js
const FEATURES = [
  { iconId: 'cpu',    title: 'KI-Lerninhalte',    desc: '...' },
  { iconId: 'flag',   title: 'Schweizer Kontext',  desc: '...' },
  { iconId: 'trophy', title: 'Gamification',       desc: '...' },
]
```

### Topic Preview — Level Indicator

Replace `🌱🌿🌳` level icons with colored bar/dot system. Use the same colored dot from LEVEL_OPTIONS:
```jsx
<div style={{ width: 36, height: 36, background: `${color}18`, borderRadius: 10,
  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <div style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
</div>
```

### "Was dich erwartet" List

Replace emoji icons with SVG:
```js
[
  { iconId: 'book-open', text: 'Strukturierter Lerntext (ca. 300 Wörter)' },
  { iconId: 'brain',     text: '5 Multiple-Choice-Quizfragen zum Testen' },
  { iconId: 'zap',       text: 'XP verdienen und Level aufsteigen' },
]
```

### CTA Section

Replace `🚀 Bereit zu lernen?` — either remove the icon or use a small arrow/chevron SVG.

---

## 8. Files Changed

| File | Changes |
|---|---|
| `src/components/Sidebar.jsx` | AREAS: add `color`/`photo`, remove `icon`; NavItem: HomeIcon/ChartIcon SVGs; AreaChip component; remove 🌐 emoji |
| `src/components/Home.jsx` | Photo cards for recommended + all areas; remove `a.icon`; remove ⭐ |
| `src/components/LandingPage.jsx` | Photo area cards (already partially done); SVG feature icons; SVG level icons; SVG list icons; remove 🚀 CTA |
| `src/components/Header.jsx` | StreakRing SVG; crosshair SVG for profile button; remove 🔥🎯 |
| `src/components/NeedFinderPanel.jsx` | StepIndicator component; remove GOAL/LEVEL emoji icons; AreaChip for recommendations; remove 🎯✏️💼⭐ |
| `src/lib/gamification.js` | BADGES: `icon` → `iconId` strings |
| `src/components/Progress.jsx` | BadgeIcon component; render badges with SVG |

---

## Non-Goals

- No external icon library (Lucide, Heroicons, Phosphor) — all SVGs inlined
- No redesign of layout, spacing, or color system
- No changes to data model or Supabase schema
- No changes to auth flow
