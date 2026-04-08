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
