'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Props {
  activePage?: string
}

const links = [
  { href: '/#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function MarketingNav({ activePage }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <style>{`
        .mnav-links { display: flex; align-items: center; gap: 32px; }
        .mnav-cta { display: flex; gap: 10px; align-items: center; }
        .mnav-hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
        @media (max-width: 768px) {
          .mnav-links { display: none; }
          .mnav-cta { display: none; }
          .mnav-hamburger { display: flex; flex-direction: column; gap: 5px; }
        }
      `}</style>

      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(250,249,246,.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e8e7e2', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, background: '#1a5fd4', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>O</div>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#0f0f0e' }}>Onvanta</span>
        </Link>

        <div className="mnav-links">
          {links.map(link => (
            <Link key={link.href} href={link.href} style={{ fontSize: 14, color: activePage === link.label ? '#0f0f0e' : '#3a3a38', fontWeight: activePage === link.label ? 500 : 400, textDecoration: 'none' }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mnav-cta">
          <Link href="/login" style={{ fontSize: 14, color: '#3a3a38', textDecoration: 'none', padding: '7px 14px' }}>Log in</Link>
          <Link href="/signup" style={{ fontSize: 14, fontWeight: 500, color: 'white', background: '#1a5fd4', padding: '8px 18px', borderRadius: 10, textDecoration: 'none' }}>Start free trial →</Link>
        </div>

        <button className="mnav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span style={{ display: 'block', width: 22, height: 2, background: '#0f0f0e', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: '#0f0f0e', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: '#0f0f0e', borderRadius: 2 }} />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(250,249,246,.98)', display: 'flex', flexDirection: 'column', padding: '80px 24px 40px' }}>
          <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 18, right: 20, background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: '#0f0f0e', lineHeight: 1 }}>×</button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {links.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} style={{ fontSize: 22, fontWeight: 400, color: '#0f0f0e', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid #e8e7e2' }}>
                {link.label}
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/login" onClick={() => setOpen(false)} style={{ fontSize: 16, color: '#3a3a38', textDecoration: 'none', padding: '13px 0', textAlign: 'center', border: '1px solid #e8e7e2', borderRadius: 12 }}>
              Log in
            </Link>
            <Link href="/signup" onClick={() => setOpen(false)} style={{ fontSize: 16, fontWeight: 500, color: 'white', background: '#1a5fd4', padding: '13px 0', borderRadius: 12, textDecoration: 'none', textAlign: 'center' }}>
              Start free trial →
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
