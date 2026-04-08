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
