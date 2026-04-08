# Need Finder Redesign — Design Spec

## Overview

Redesign the Need Finder to appear before login as a persistent narrow right-column panel on the landing page. After completing the flow, the user is directed to a fully redesigned Auth page (matching the landing page style). After login, the Need Finder becomes a persistent "Mein Profil" panel in the dashboard, always editable.

---

## 1. Layout & Structure

### Landing Page
- **Layout**: Two-column layout — left takes `calc(100% - 280px)`, right panel is `280px` fixed width
- The left column contains all existing landing page content (Hero, Fachbereiche, Features, Testimonials) unchanged in structure, just narrower
- The right panel is `position: sticky; top: 0; height: 100vh` — always visible as user scrolls
- Panel styling: white background, `border-left: 3px solid #1D9E75`, subtle box shadow
- **Mobile (< 768px)**: Right panel is hidden. A sticky bottom bar appears with "Lernpfad personalisieren →" CTA. Tapping opens the Need Finder as a modal (full-width, bottom sheet style).

### App Dashboard (after login)
- Layout: existing Sidebar (left) + main content (center) + Mein Profil panel (right, `280px`)
- The right panel is always visible on desktop, collapsible on mobile

---

## 2. Need Finder Flow

Three steps, displayed vertically in the panel. Recommendation updates live after each answered step.

### Step 1 — Beruf (Freitext)
- Label: "Was ist dein Beruf?"
- Input: text field, placeholder "z.B. Softwareentwickler, Buchhalter…"
- On input change (debounced 500ms): call Claude API to map job → 1–2 recommended Fachbereiche from the 8 available (ICT, Marketing, Finanzen, Management, HR, Recht, Verkauf, VWL)
- Live preview shown below input: "→ ICT & Informatik" while typing
- Mapping prompt: short, fast — "Welche 1-2 der folgenden Fachbereiche passen am besten zum Beruf '{job}'? Antworte nur mit den Fachbereich-IDs: ict, marketing, finanzen, management, hr, recht, verkauf, vwl"

### Step 2 — Ziel
- Label: "Was ist dein Ziel?"
- Four radio-button style options:
  1. 💼 Weiterbildung im aktuellen Job
  2. 🚀 Jobwechsel vorbereiten
  3. 📋 Prüfung / Zertifikat ablegen
  4. 🌍 Allgemeinwissen aufbauen

### Step 3 — Niveau
- Label: "Dein Niveau?"
- Three options:
  1. 🌱 Einsteiger
  2. 🌿 Fortgeschrittener
  3. 🌳 Experte

### Live Recommendation
- Shown below the steps as soon as Step 1 is filled
- Updates after each step change
- Displays recommended Fachbereiche (icons + names)
- "Jetzt starten →" CTA button at bottom — navigates to Auth page, passing preferences via localStorage

### Data Persistence
- Preferences saved to `localStorage` under key `learnhub_preferences`
- Structure: `{ job: string, jobAreas: string[], goal: string, level: string }`
- Existing `learnhub_preferences` format extended with `job` and `jobAreas` fields
- No new Supabase table needed

---

## 3. Auth Page Redesign

The existing `Auth.jsx` is restyled to match the landing page aesthetic.

### Visual Changes
- **Background**: `linear-gradient(135deg, #064E3B 0%, #1D9E75 100%)` — same as landing hero
- **Card**: Glassmorphism — `background: rgba(255,255,255,0.12)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(255,255,255,0.2)`, `border-radius: 20px`
- **Text on card**: white (headings), `rgba(255,255,255,0.75)` (sub-text)
- **Inputs**: `background: rgba(255,255,255,0.15)`, white text, white placeholder, `border: 1px solid rgba(255,255,255,0.3)`, rounded
- **Primary button**: white background, `#064E3B` text (inverted from card)
- **"← Zurück" button**: remains, styled as ghost button (white border, white text)
- **Logo**: "L" icon + "LearnHub" in white

### Mobile
- Card: 90% viewport width, padding reduced
- Inputs: full width, `font-size: 16px` (prevents iOS zoom)

---

## 4. Dashboard "Mein Profil" Panel

After login, the right panel shows the saved Need Finder profile and is always editable.

### Panel Content
- Header: "🎯 Mein Profil" + "✏️ Ändern" button (top right)
- Profile summary card:
  - Beruf (free text, as entered)
  - Ziel (icon + label)
  - Niveau (icon + label)
- "Empfohlen für dich" section: list of recommended Fachbereiche with icons
- "Profil neu erstellen" link at bottom — re-runs the full flow inline in the panel

### Edit Mode
- Clicking "✏️ Ändern" or "Profil neu erstellen" replaces panel content with the 3-step flow
- On completion: saves to localStorage, updates panel, updates Home.jsx recommendations
- No page navigation needed

### Mobile
- Panel hidden by default on mobile (< 768px)
- Accessible via "Mein Profil" button in Header or Sidebar

---

## 5. Files Affected

| File | Change |
|------|--------|
| `src/components/LandingPage.jsx` | Add right panel wrapper, NeedFinderPanel component, mobile bottom bar + modal |
| `src/components/NeedFinderPanel.jsx` | New component — the 3-step panel (used on landing + dashboard) |
| `src/components/Auth.jsx` | Full visual restyle to match landing page |
| `src/App.jsx` | Add right panel to logged-in layout; pass preferences update handler |
| `src/components/Home.jsx` | Read `job` + `jobAreas` from preferences for recommendations |
| `src/lib/claude.js` | Add `mapJobToAreas(job)` function using Claude API |

---

## 6. Out of Scope

- No new Supabase tables or backend changes
- No changes to gamification, quiz, learn, or progress features
- No react-router introduction
- The existing NeedFinder.jsx (post-login modal) is replaced by the new panel; the old file can be deleted
