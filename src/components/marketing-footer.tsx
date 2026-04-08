import Link from 'next/link'

export default function MarketingFooter() {
  return (
    <footer style={{ background: '#0f0f0e', padding: '48px 40px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 30, height: 30, background: '#1a5fd4', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>O</div>
            <span style={{ fontSize: 16, fontWeight: 500, color: 'white' }}>Onvanta</span>
          </div>
          <p style={{ fontSize: 14, color: '#7a7a78', lineHeight: 1.6, maxWidth: 260 }}>Nieuwe medewerkers, sneller productief. Onboarding, training en kennisretentie in één systeem.</p>
        </div>
        {[
          { title: 'Product', links: [{ label: 'Functies', href: '/#functies' }, { label: 'Prijzen', href: '/pricing' }] },
          { title: 'Bedrijf', links: [{ label: 'Over ons', href: '/about' }, { label: 'Contact', href: '/contact' }] },
          { title: 'Juridisch', links: [{ label: 'Privacybeleid', href: '/privacy' }, { label: 'Algemene voorwaarden', href: '/terms' }] },
        ].map((col, i) => (
          <div key={i}>
            <h4 style={{ fontSize: 13, fontWeight: 500, color: 'white', marginBottom: 16 }}>{col.title}</h4>
            {col.links.map((l, j) => (
              <div key={j} style={{ marginBottom: 10 }}>
                <Link href={l.href} style={{ fontSize: 14, color: '#7a7a78', textDecoration: 'none' }}>{l.label}</Link>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 24, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7a7a78' }}>
        <span>© 2026 Onvanta. Alle rechten voorbehouden.</span>
        <span>Gemaakt in Nederland 🇳🇱</span>
      </div>
    </footer>
  )
}
