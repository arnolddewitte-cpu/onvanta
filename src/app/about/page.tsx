import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'
import CookieBanner from '@/components/cookie-banner'

export default function AboutPage() {
  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh' }}>
      <style>{`
        .ab-values-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        @media (max-width: 768px) {
          .ab-values-grid { grid-template-columns: 1fr !important; }
          .ab-hero { padding: 48px 20px 40px !important; }
          .ab-story { padding: 0 20px 48px !important; }
          .ab-story-card { padding: 28px 24px !important; }
          .ab-values-section { padding: 48px 20px !important; }
          .ab-cta { padding: 60px 20px !important; }
        }
      `}</style>

      <MarketingNav activePage="Over ons" />

      {/* Hero */}
      <section className="ab-hero" style={{ maxWidth: 760, margin: '0 auto', padding: '80px 40px 64px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 12px', borderRadius: 20, marginBottom: 20 }}>
          Ons verhaal
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 400, lineHeight: 1.12, color: '#0f0f0e', marginBottom: 20 }}>
          Gebouwd door iemand die<br /><em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>er zelf in stond.</em>
        </h1>
        <p style={{ fontSize: 18, fontWeight: 300, color: '#3a3a38', lineHeight: 1.7, maxWidth: 580, margin: '0 auto' }}>
          Onvanta is ontstaan uit frustratie. Na 15+ jaar in print-on-demand zag ik goede mensen mislukken — niet omdat ze niet capabel waren, maar omdat niemand ze een goede start gaf.
        </p>
      </section>

      {/* Verhaal */}
      <section className="ab-story" style={{ maxWidth: 760, margin: '0 auto', padding: '0 40px 80px' }}>
        <div className="ab-story-card" style={{ background: 'white', borderRadius: 20, border: '1px solid #e8e7e2', padding: '48px 56px', marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, color: '#0f0f0e', marginBottom: 16 }}>Het probleem dat we steeds zagen</h2>
          <p style={{ fontSize: 16, color: '#3a3a38', lineHeight: 1.7, fontWeight: 300, marginBottom: 16 }}>
            Nieuwe klantenservicemedewerkers die klanten vertelden dat tampondruk full-colour foto's aankan. Verkopers die zeefdrukoffertes maakten zonder het aantal logokleuren mee te tellen. Operators die procedures gokten omdat de kennis in één hoofd zat.
          </p>
          <p style={{ fontSize: 16, color: '#3a3a38', lineHeight: 1.7, fontWeight: 300 }}>
            Het probleem waren niet de mensen. Het was de onboarding. Of eigenlijk: het ontbreken ervan. Een Word-document, een dag meeloopstage en een &ldquo;je komt er wel achter&rdquo; — dat was wat de meeste teams gebruikten.
          </p>
        </div>

        <div className="ab-story-card" style={{ background: 'white', borderRadius: 20, border: '1px solid #e8e7e2', padding: '48px 56px', marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, color: '#0f0f0e', marginBottom: 16 }}>Waarom we Onvanta bouwden</h2>
          <p style={{ fontSize: 16, color: '#3a3a38', lineHeight: 1.7, fontWeight: 300, marginBottom: 16 }}>
            We wilden iets dat gestructureerde onboarding combineert met echte kennisretentie. Niet alleen &ldquo;hier is een checklist&rdquo; — maar een systeem dat zorgt dat kennis ook echt blijft hangen, met spaced repetition zoals taalleerapps dat doen.
          </p>
          <p style={{ fontSize: 16, color: '#3a3a38', lineHeight: 1.7, fontWeight: 300 }}>
            En we wilden dat managers echte zichtbaarheid hebben. Niet een 30-dagengesprek waarbij je ontdekt dat iemand drie weken heeft zitten worstelen. Realtime signalen zodat je vroeg kunt ingrijpen.
          </p>
        </div>

        <div className="ab-story-card" style={{ background: 'white', borderRadius: 20, border: '1px solid #e8e7e2', padding: '48px 56px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, color: '#0f0f0e', marginBottom: 16 }}>Voor wie we bouwen</h2>
          <p style={{ fontSize: 16, color: '#3a3a38', lineHeight: 1.7, fontWeight: 300, marginBottom: 16 }}>
            Nu: print-on-demand en logistieke bedrijven met 10–50 medewerkers. We kennen deze wereld van binnenuit en onze templates weerspiegelen dat — echte druktechnieken-kennis, echte klantcommunicatiescenario&apos;s, echte procedures.
          </p>
          <p style={{ fontSize: 16, color: '#3a3a38', lineHeight: 1.7, fontWeight: 300 }}>
            Binnenkort: elk groeiend bedrijf dat mensen aanneemt en hen sneller productief wil maken. Het probleem is universeel. De oplossing schaalt mee.
          </p>
        </div>
      </section>

      {/* Waarden */}
      <section className="ab-values-section" style={{ background: '#f2f1ed', padding: '80px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, color: '#0f0f0e' }}>
              Waar we in <em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>geloven.</em>
            </h2>
          </div>
          <div className="ab-values-grid">
            {[
              { icon: '🎯', title: 'Specificiteit wint van algemeenheid', desc: 'Een template gebouwd voor POD-klantenservice is meer waard dan een generieke onboarding-checklist. We bouwen voor specifieke functies, specifieke sectoren.' },
              { icon: '🧠', title: 'Kennis moet beklijven', desc: 'Iets één keer lezen is geen leren. Spaced repetition is geen luxe — het is het verschil tussen weten en vergeten.' },
              { icon: '👁️', title: 'Managers hebben signalen nodig, geen rapporten', desc: 'Een 30-dagengesprek is te laat. Managers moeten al in week één weten als iemand moeite heeft — zodat ze er nog iets aan kunnen doen.' },
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
      <section className="ab-cta" style={{ background: '#1a5fd4', padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, color: 'white', marginBottom: 16 }}>Klaar voor slimmere onboarding?</h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,.8)', fontWeight: 300, maxWidth: 440, margin: '0 auto 32px' }}>14 dagen gratis. Volledige toegang. Geen creditcard vereist.</p>
        <a href="/signup" style={{ fontSize: 16, fontWeight: 500, color: '#1a5fd4', background: 'white', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', display: 'inline-block' }}>
          Gratis proberen →
        </a>
      </section>

      <MarketingFooter />
      <CookieBanner />
    </main>
  )
}
