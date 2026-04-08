import { useState, useEffect } from 'react'
import { generateQuiz } from '../lib/claude'
import { supabase } from '../lib/supabase'
import confetti from 'canvas-confetti'

export default function Quiz({ topic, area, userId, onBack, onDone, onScoreSaved }) {
  const [questions, setQuestions] = useState(null)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    generateQuiz(topic.name, area.name, topic.level || 'einsteiger').then(q => {
      if (!q) { setError(true); setLoading(false); return }
      setQuestions(q)
      setLoading(false)
    })
  }, [topic.id])

  const handleNext = async () => {
    const correct = questions[current].ans === selected
    const newScore = correct ? score + 1 : score
    if (current + 1 >= questions.length) {
      await supabase.from('user_progress').upsert({
        user_id: userId, topic_id: topic.id,
        quiz_score: newScore, quiz_total: questions.length,
        last_studied: new Date().toISOString()
      }, { onConflict: 'user_id,topic_id' })
      onScoreSaved(topic.id, newScore, questions.length)
      setScore(newScore)
      setDone(true)
      if (newScore / questions.length >= 0.8) {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#1D9E75', '#6EE7B7', '#F59E0B', '#fff'] })
      }
    } else {
      setScore(newScore)
      setCurrent(c => c + 1)
      setSelected(null)
    }
  }

  if (loading) return (
    <div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 12, color: '#6B7280', fontSize: 14 }}>
      <div style={{ width: 20, height: 20, border: '2px solid #E5E7EB', borderTopColor: '#F59E0B', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      Quiz wird generiert...
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ padding: 40 }}>
      <p style={{ color: '#EF4444', marginBottom: 16 }}>Quiz konnte nicht geladen werden.</p>
      <button onClick={onBack} style={{ padding: '10px 20px', background: '#F3F4F6', borderRadius: 8, fontSize: 14 }}>← Zurück</button>
    </div>
  )

  if (done) return (
    <div style={{ padding: '40px 48px', maxWidth: 560 }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Quiz abgeschlossen!</h2>
      <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 32 }}>
        Du hast <strong style={{ color: '#1D9E75' }}>{score} von {questions.length}</strong> Fragen richtig beantwortet.
      </p>
      <button onClick={onDone} style={{ padding: '10px 22px', background: '#1D9E75', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }}>
        Fertig
      </button>
    </div>
  )

  const q = questions[current]
  return (
    <div style={{ padding: '40px 48px', maxWidth: 640 }}>
      <button onClick={onBack} style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>← Zurück</button>
      <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>Frage {current + 1} / {questions.length}</div>
      <h3 style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.5, marginBottom: 24 }}>{q.q}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => setSelected(i)} style={{
            padding: '13px 18px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontSize: 14,
            background: selected === i ? '#1D9E75' : '#fff',
            color: selected === i ? '#fff' : '#111827',
            border: '1px solid ' + (selected === i ? '#1D9E75' : 'rgba(0,0,0,0.1)'),
            fontFamily: 'inherit', transition: 'all .15s'
          }}>{opt}</button>
        ))}
      </div>

      {selected !== null && (
        <div>
          <div style={{ padding: '12px 16px', background: '#F0FDF9', border: '1px solid #A7F3D0', borderRadius: 10, fontSize: 14, color: '#065F46', marginBottom: 16 }}>
            {q.explain}
          </div>
          <button onClick={handleNext} style={{
            padding: '10px 22px', background: '#1D9E75', color: '#fff', borderRadius: 8,
            fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer'
          }}>
            {current + 1 >= questions.length ? 'Ergebnis anzeigen' : 'Weiter →'}
          </button>
        </div>
      )}
    </div>
  )
}
