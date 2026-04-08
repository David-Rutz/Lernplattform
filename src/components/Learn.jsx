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

    // Show "generating" hint after 300ms only if still loading (indicates cache miss)
    const timer = setTimeout(() => setGenerating(true), 300)

    generateContent(topic.id, topic.name, area.name, topic.level || 'einsteiger')
      .then(result => {
        clearTimeout(timer)
        setContent(result?.text || '')
        setLoading(false)
        setGenerating(false)
      })

    return () => clearTimeout(timer)
  }, [topic.id])

  const handleLearned = async () => {
    setMarking(true)
    await supabase.from('user_progress').upsert({
      user_id: userId, topic_id: topic.id, learned: true, last_studied: new Date().toISOString()
    }, { onConflict: 'user_id,topic_id' })
    onLearned(topic.id)
    setMarking(false)
    onBack()
  }

  return (
    <div style={{ padding: '40px 48px', maxWidth: 760 }}>
      <button onClick={onBack} style={{ color: '#6B7280', fontSize: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Zurück
      </button>

      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em' }}>{area.name}</span>
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 28 }}>{topic.name}</h1>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#6B7280', fontSize: 14 }}>
          <div style={{ width: 20, height: 20, border: '2px solid #E5E7EB', borderTopColor: '#1D9E75', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
          {generating ? 'KI generiert gerade...' : 'Lade Inhalt...'}
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : (
        <div style={{ fontSize: 15, lineHeight: 1.85, color: '#1F2937', whiteSpace: 'pre-wrap' }}>{content}</div>
      )}

      {!loading && (
        <div style={{ marginTop: 40, display: 'flex', gap: 12 }}>
          <button onClick={handleLearned} disabled={marking} style={{
            padding: '10px 22px', background: '#1D9E75', color: '#fff', borderRadius: 8,
            fontSize: 14, fontWeight: 500, cursor: 'pointer', border: 'none'
          }}>
            {marking ? 'Wird gespeichert...' : '✓ Als gelernt markieren'}
          </button>
          <button onClick={onStartQuiz} style={{
            padding: '10px 22px', background: '#F59E0B', color: '#fff', borderRadius: 8,
            fontSize: 14, fontWeight: 500, cursor: 'pointer', border: 'none'
          }}>
            Quiz starten →
          </button>
        </div>
      )}
    </div>
  )
}
