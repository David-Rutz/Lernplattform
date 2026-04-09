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
  { id: 'first_step',  label: 'Erster Schritt', iconId: 'check-circle', desc: 'Erstes Thema gelernt' },
  { id: 'quiz_master', label: 'Quiz-Meister',   iconId: 'star',         desc: '5 Quizze mit 100% bestanden' },
  { id: 'allrounder',  label: 'Allrounder',     iconId: 'globe',        desc: 'Alle 8 Fachbereiche angetastet' },
  { id: 'streak_7',    label: 'Streak-7',       iconId: 'flame',        desc: '7 Tage in Folge gelernt' },
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
