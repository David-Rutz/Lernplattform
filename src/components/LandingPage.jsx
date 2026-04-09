import { useState } from 'react'
import { AREAS } from './Sidebar'
import { supabase } from '../lib/supabase'
import NeedFinderPanel from './NeedFinderPanel'

const BookIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
)
const FlagIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
)
const TrophyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 22 12 17 16 22"/><polyline points="7 10 7 4 17 4 17 10"/><path d="M7 10a5 5 0 0 0 10 0"/><line x1="12" y1="17" x2="12" y2="22"/><path d="M7 4H5a2 2 0 0 0-2 2v1a5 5 0 0 0 5 5"/><path d="M17 4h2a2 2 0 0 1 2 2v1a5 5 0 0 1-5 5"/>
  </svg>
)

const FEATURES = [
  { Icon: BookIcon,   title: 'KI-Lerninhalte',   desc: 'Personalisiert für dein Level und Fachbereich' },
  { Icon: FlagIcon,   title: 'Schweizer Kontext', desc: 'Praxisbeispiele aus dem Schweizer Berufsalltag' },
  { Icon: TrophyIcon, title: 'Gamification',      desc: 'XP sammeln, Level aufsteigen, Badges gewinnen' },
]

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'HR Business Partner', text: 'Endlich eine Plattform, die mir genau das erklärt, was ich für meinen Job brauche – ohne stundenlange Videos.' },
  { name: 'Marco B.', role: 'ICT Projektleiter', text: 'Die KI-Inhalte sind erstaunlich präzise. Ich lerne täglich 20 Minuten und merke echten Fortschritt.' },
  { name: 'Lea M.', role: 'Marketing Managerin', text: 'Das Quiz-System hilft mir, wirklich zu überprüfen ob ich den Stoff verstanden habe. Super Konzept!' },
]

const LEVEL_LABELS = { einsteiger: 'Einsteiger', fortgeschrittene: 'Fortgeschrittene', experte: 'Experte' }
const LEVEL_COLORS = { einsteiger: '#1D9E75', fortgeschrittene: '#F59E0B', experte: '#6366F1' }

export default function LandingPage({ onStartAuth, backToDashboard }) {
  const [view, setView] = useState('home') // 'home' | 'area' | 'topic'
  const [selectedArea, setSelectedArea] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [areaTopics, setAreaTopics] = useState([])
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [lpPreferences, setLpPreferences] = useState(() => {
    try { return JSON.parse(localStorage.getItem('learnhub_preferences') || 'null') } catch { return null }
  })
  const [showMobilePanel, setShowMobilePanel] = useState(false)

  const handleThemen = (e) => {
    e.preventDefault()
    document.getElementById('fachbereiche')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleAreaClick = async (area) => {
    setSelectedArea(area)
    setView('area')
    setLoadingTopics(true)
    const { data } = await supabase.from('topics').select('*').eq('area_id', area.id).order('sort_order')
    setAreaTopics(data || [])
    setLoadingTopics(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic)
    setView('topic')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    if (view === 'topic') { setView('area'); setSelectedTopic(null) }
    else { setView('home'); setSelectedArea(null); setAreaTopics([]) }
  }

  const CSS = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .lp-fade { animation: fadeUp .6s ease both; }
    .lp-fade-2 { animation: fadeUp .6s .15s ease both; }
    .lp-fade-3 { animation: fadeUp .6s .3s ease both; }
    .lp-fadein { animation: fadeIn .4s ease both; }
    .area-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.18) !important; }
    .area-card { transition: transform .2s, box-shadow .2s; }
    .topic-card:hover { box-shadow: 0 4px 20px rgba(29,158,117,0.15) !important; border-color: #1D9E75 !important; }
    .topic-card { transition: box-shadow .2s, border-color .2s; }
    .cta-btn:hover { opacity: .9; transform: translateY(-1px); }
    .cta-btn { transition: opacity .15s, transform .15s; }
    @media (max-width: 640px) {
      .hero-btns { flex-direction: column !important; }
      .areas-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .features-grid { grid-template-columns: 1fr !important; }
      .testimonials-grid { grid-template-columns: 1fr !important; }
      .navbar-cta-text { display: none; }
    }
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
  `

  const Navbar = ({ showBack }) => (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(6,40,30,0.97)', backdropFilter: 'blur(8px)',
      padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255,255,255,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {showBack && (
          <button onClick={handleBack} style={{
            background: 'none', border: 'none', color: '#A7F3D0', fontSize: 14,
            cursor: 'pointer', padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6
          }}>← Zurück</button>
        )}
        <button onClick={() => { setView('home'); setSelectedArea(null); setSelectedTopic(null) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: 0 }}>
          <div style={{ width: 34, height: 34, background: '#1D9E75', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>L</div>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em' }}>LearnHub</span>
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {backToDashboard ? (
          <button onClick={backToDashboard} className="cta-btn" style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            → Zum Dashboard
          </button>
        ) : (
          <>
            <button onClick={onStartAuth} className="navbar-cta-text" style={{ background: 'none', border: 'none', color: '#A7F3D0', fontSize: 14, cursor: 'pointer', padding: '6px 12px', borderRadius: 8 }}>Anmelden</button>
            <button onClick={onStartAuth} className="cta-btn" style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Kostenlos starten</button>
          </>
        )}
      </div>
    </nav>
  )

  // ── TOPIC PREVIEW VIEW ──────────────────────────────────────────────
  if (view === 'topic' && selectedTopic && selectedArea) {
    const color = LEVEL_COLORS[selectedTopic.level] || '#1D9E75'
    return (
      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111827', minHeight: '100vh', background: '#F8F9FA' }}>
        <style>{CSS}</style>
        <Navbar showBack />

        {/* Topic Hero */}
        <div style={{ background: `linear-gradient(160deg, #064E3B, ${color})`, padding: '52px 24px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
          <div className="lp-fadein">
            <button onClick={() => setView('area')} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#A7F3D0', fontSize: 12, padding: '4px 14px', borderRadius: 20, cursor: 'pointer', marginBottom: 20 }}>
              {selectedArea.name}
            </button>
            <h1 style={{ color: '#fff', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.02em' }}>
              {selectedTopic.name}
            </h1>
            {selectedTopic.level && (
              <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 20, marginBottom: 28 }}>
                {LEVEL_LABELS[selectedTopic.level] || selectedTopic.level}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
          {/* Was dich erwartet */}
          <div style={{ background: '#fff', borderRadius: 20, padding: '32px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, color: '#1D9E75', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Was dich erwartet</div>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#374151', marginBottom: 20 }}>
              In diesem Lernmodul tauchst du in die wichtigsten Konzepte von <strong>{selectedTopic.name}</strong> im Bereich {selectedArea.name} ein.
              Die Inhalte werden von KI auf dein Niveau zugeschnitten und mit praxisnahen Beispielen aus dem Schweizer Kontext erklärt.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Strukturierter Lerntext (ca. 300 Wörter)',
                '5 Multiple-Choice-Quizfragen zum Testen',
                'XP verdienen und Level aufsteigen',
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F8F9FA', borderRadius: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#374151' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Level info */}
          {selectedTopic.level && (
            <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', marginBottom: 24, border: `2px solid ${color}20`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, background: `${color}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color }}>Level: {LEVEL_LABELS[selectedTopic.level]}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    {selectedTopic.level === 'einsteiger' ? 'Kein Vorwissen nötig — ideal zum Einstieg'
                      : selectedTopic.level === 'fortgeschrittene' ? 'Grundwissen hilfreich — baut auf Basics auf'
                      : 'Tiefes Verständnis — für Fachexperten'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{ background: 'linear-gradient(135deg, #064E3B, #1D9E75)', borderRadius: 20, padding: '32px', textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Bereit zu lernen?</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 }}>Erstelle kostenlos ein Konto und starte sofort.</p>
            <button onClick={onStartAuth} className="cta-btn" style={{ background: '#fff', color: '#064E3B', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              Jetzt kostenlos registrieren →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── AREA TOPICS VIEW ────────────────────────────────────────────────
  if (view === 'area' && selectedArea) {
    return (
      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111827', minHeight: '100vh', background: '#F8F9FA' }}>
        <style>{CSS}</style>
        <Navbar showBack />

        {/* Area Hero */}
        <div style={{
          background: 'linear-gradient(160deg, #064E3B 0%, #065F46 50%, #1D9E75 100%)',
          padding: '48px 24px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.08 }} />
          <div className="lp-fadein" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, overflow: 'hidden', margin: '0 auto 12px', boxShadow: `0 0 0 3px ${selectedArea.color}` }}>
              <img src={`https://images.unsplash.com/${selectedArea.photo}?w=120&q=80`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>{selectedArea.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>
              {loadingTopics ? 'Lade Themen...' : `${areaTopics.length} Lernthemen verfügbar`}
            </p>
          </div>
        </div>

        {/* Topics */}
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px' }}>
          {loadingTopics ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div style={{ width: 32, height: 32, border: '3px solid #E5E7EB', borderTopColor: '#1D9E75', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : areaTopics.length === 0 ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '60px 0' }}>Noch keine Themen verfügbar.</p>
          ) : (
            <>
              <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 20 }}>Klicke auf ein Thema um eine Vorschau zu sehen</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {areaTopics.map(t => {
                  const color = LEVEL_COLORS[t.level] || '#1D9E75'
                  return (
                    <button key={t.id} onClick={() => handleTopicClick(t)} className="topic-card" style={{
                      background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16,
                      padding: '20px 24px', textAlign: 'left', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 16,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                      <div style={{ width: 44, height: 44, background: `${color}15`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: '#111827' }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>
                          Lerntext · Quiz · XP verdienen
                        </div>
                      </div>
                      {t.level && (
                        <span style={{ fontSize: 11, fontWeight: 600, color, background: `${color}15`, padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>
                          {LEVEL_LABELS[t.level] || t.level}
                        </span>
                      )}
                      <span style={{ color: '#9CA3AF', fontSize: 18, flexShrink: 0 }}>›</span>
                    </button>
                  )
                })}
              </div>

              {/* CTA after list */}
              <div style={{ marginTop: 32, padding: '24px', background: 'linear-gradient(135deg, #F0FDF9, #fff)', borderRadius: 16, border: '2px solid #1D9E75', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: '#065F46', fontWeight: 500, marginBottom: 12 }}>
                  Melde dich an um alle Inhalte freizuschalten und XP zu verdienen
                </p>
                <button onClick={onStartAuth} className="cta-btn" style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Kostenlos registrieren →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

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
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6EE7B7', display: 'inline-block', marginRight: 2 }} />
            {' '}KI-gestützt · Schweizer Kontext · Kostenlos
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
                  position: 'relative', borderRadius: 14, overflow: 'hidden',
                  aspectRatio: '3/4', cursor: 'pointer', border: 'none', padding: 0,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}>
                  <img src={`https://images.unsplash.com/${a.photo}?w=300&q=80`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${a.color}66 0%, ${a.color}ee 100%)` }} />
                  <div style={{ position: 'absolute', inset: 0, padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <div style={{ color: '#fff', fontSize: 12, fontWeight: 800, lineHeight: 1.25 }}>{a.name}</div>
                  </div>
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
                <div style={{ marginBottom: 12 }}><f.Icon /></div>
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
        <section style={{ background: 'linear-gradient(160deg, #064E3B 0%, #1D9E75 100%)', padding: '72px 24px 96px', textAlign: 'center' }}>
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
        <span style={{ fontSize: 13, fontWeight: 600 }}>Lernpfad personalisieren</span>
        <button onClick={() => setShowMobilePanel(true)} style={{ background: '#fff', color: '#1D9E75', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Starten →
        </button>
      </div>

      {/* Mobile: NeedFinder bottom sheet modal */}
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
}
