import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'

export default function AboutPage() {
  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh' }}>

      <MarketingNav activePage="About" />

      {/* Hero */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '80px 40px 64px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 12px', borderRadius: 20, marginBottom: 20 }}>
          Our story
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 400, lineHeight: 1.12, color: '#0f0f0e', marginBottom: 20 }}>
          Built by someone who's<br /><em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>been in your shoes.</em>
        </h1>
        <p style={{ fontSize: 18, fontWeight: 300, color: '#3a3a38', lineHeight: 1.7, maxWidth: 580, margin: '0 auto' }}>
          Onvanta was built out of frustration. After 15+ years in print-on-demand, I watched good people fail not because they weren't capable — but because nobody gave them a proper start.
        </p>
      </section>

      {/* Story */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 40px 80px' }}>
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8e7e2', padding: '48px 56px', marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, color: '#0f0f0e', marginBottom: 16 }}>The problem we kept seeing</h2>
          <p style={{ fontSize: 16, color: '#3a3a38', lineHeight: 1.7, fontWeight: 300, marginBottom: 16 }}>
            New customer service reps telling customers tampon printing can do full-colour photos. Sales people quoting zeefdruk jobs without counting logo colours. Operators guessing at procedures because the knowledge lived in one person's head.
          </p>
          <p style={{ fontSize: 16, color: '#3a3a38', lineHeight: 1.7, fontWeight: 300 }}>
            The problem wasn't the people. It was the onboarding. Or rather, the lack of it. A Word document, a shadowing day, and a "you'll figure it out" — that's what most teams were working with.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8e7e2', padding: '48px 56px', marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, color: '#0f0f0e', marginBottom: 16 }}>Why we built Onvanta</h2>
          <p style={{ fontSize: 16, color: '#3a3a38', lineHeight: 1.7, fontWeight: 300, marginBottom: 16 }}>
            We wanted something that combined structured onboarding with actual knowledge retention. Not just "here's a checklist" — but a system that makes sure knowledge actually sticks, using spaced repetition the way language learning apps do.
          </p>
          <p style={{ fontSize: 16, color: '#3a3a38', lineHeight: 1.7, fontWeight: 300 }}>
            And we wanted managers to have real visibility. Not a 30-day review where you find out someone's been struggling for three weeks. Real-time signals so you can step in early.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8e7e2', padding: '48px 56px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, color: '#0f0f0e', marginBottom: 16 }}>Who we're building for</h2>
          <p style={{ fontSize: 16, color: '#3a3a38', lineHeight: 1.7, fontWeight: 300, marginBottom: 16 }}>
            Right now: print-on-demand companies with 10–50 people. We know this world deeply and our templates reflect that — real druktechnieken knowledge, real klantcommunicatie scenarios, real procedures.
          </p>
          <p style={{ fontSize: 16, color: '#3a3a38', lineHeight: 1.7, fontWeight: 300 }}>
            Soon: any growing company that hires people and wants them productive faster. The problem is universal. The solution scales.
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: '#f2f1ed', padding: '80px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, color: '#0f0f0e' }}>
              What we believe <em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>in.</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: '🎯', title: 'Specificity beats generality', desc: 'A template built for POD customer service is worth more than a generic onboarding checklist. We build for specific roles, specific industries.' },
              { icon: '🧠', title: 'Knowledge has to stick', desc: 'Reading something once is not learning. Spaced repetition is not a nice-to-have — it\'s the difference between knowing and forgetting.' },
              { icon: '👁️', title: 'Managers need signals, not reports', desc: 'A 30-day review is too late. Managers should know in week one if someone is struggling — so they can actually do something about it.' },
            ].map((v, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #e8e7e2' }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{v.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#0f0f0e', marginBottom: 8 }}>{v.title}</div>
                <div style={{ fontSize: 14, color: '#3a3a38', lineHeight: 1.6, fontWeight: 300 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#1a5fd4', padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, color: 'white', marginBottom: 16 }}>Ready to onboard smarter?</h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,.8)', fontWeight: 300, maxWidth: 440, margin: '0 auto 32px' }}>14 days free. Full Pro access. No credit card required.</p>
        <a href="/signup" style={{ fontSize: 16, fontWeight: 500, color: '#1a5fd4', background: 'white', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', display: 'inline-block' }}>
          Start free trial →
        </a>
      </section>

      <MarketingFooter />
    </main>
  )
}