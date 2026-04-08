import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { xpForAction, getLevel, checkNewBadges } from './lib/gamification'
import Auth from './components/Auth'
import LandingPage from './components/LandingPage'
import Sidebar, { AREAS } from './components/Sidebar'
import Home from './components/Home'
import TopicList from './components/TopicList'
import Learn from './components/Learn'
import Quiz from './components/Quiz'
import Progress from './components/Progress'
import Header from './components/Header'

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
  const [stats, setStats] = useState({ xp: 0, level: 1, streak: 0, last_studied_date: null, badges: [] })

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
      loadStats()
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

  const loadStats = async () => {
    const { data } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', session.user.id)
      .single()
    if (data) setStats(data)
  }

  const awardXp = async (action, score = 0, total = 1, currentStats = stats, currentAreaProgress = areaProgress) => {
    const gain = xpForAction(action, score, total)
    if (gain === 0) return

    const newXp = currentStats.xp + gain
    const newLevel = getLevel(newXp).level

    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    let newStreak = currentStats.streak
    if (currentStats.last_studied_date !== today) {
      newStreak = currentStats.last_studied_date === yesterday ? currentStats.streak + 1 : 1
    }

    const learnedCount = Object.values(progress).filter(p => p.learned).length + (action === 'learned' ? 1 : 0)
    const perfectQuizzes = Object.values(progress).filter(p => p.quiz_score != null && p.quiz_score === p.quiz_total).length + (action === 'quiz' && score === total ? 1 : 0)
    const touchedAreas = Object.keys(currentAreaProgress).filter(aId => Object.keys(currentAreaProgress[aId]).length > 0).length
    const newBadgeIds = checkNewBadges(currentStats.badges, { learnedCount, perfectQuizCount: perfectQuizzes, touchedAreas, streak: newStreak })
    const newBadges = [...currentStats.badges, ...newBadgeIds]

    const updated = { user_id: session.user.id, xp: newXp, level: newLevel, streak: newStreak, last_studied_date: today, badges: newBadges }
    await supabase.from('user_stats').upsert(updated, { onConflict: 'user_id' })
    setStats({ xp: newXp, level: newLevel, streak: newStreak, last_studied_date: today, badges: newBadges })
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
        stats={stats}
      />
      <main style={{ flex: 1, overflowY: 'auto', background: '#F8F9FA', display: 'flex', flexDirection: 'column' }}>
        <Header stats={stats} />
        <div style={{ flex: 1 }}>
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
    </div>
  )
}
