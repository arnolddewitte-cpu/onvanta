import Link from 'next/link'

interface Props {
  activePage?: string
}

export default function MarketingNav({ activePage }: Props) {
  const links = [
    { href: '/#features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(250,249,246,.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e8e7e2', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{ width: 30, height: 30, background: '#1a5fd4', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>O</div>
        <span style={{ fontSize: 16, fontWeight: 500, color: '#0f0f0e' }}>Onvanta</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {links.map(link => (
          <Link key={link.href} href={link.href} style={{ fontSize: 14, color: activePage === link.label ? '#0f0f0e' : '#3a3a38', fontWeight: activePage === link.label ? 500 : 400, textDecoration: 'none' }}>
            {link.label}
          </Link>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Link href="/login" style={{ fontSize: 14, color: '#3a3a38', textDecoration: 'none', padding: '7px 14px' }}>Log in</Link>
        <Link href="/signup" style={{ fontSize: 14, fontWeight: 500, color: 'white', background: '#1a5fd4', padding: '8px 18px', borderRadius: 10, textDecoration: 'none' }}>Start free trial →</Link>
      </div>
    </nav>
  )
}