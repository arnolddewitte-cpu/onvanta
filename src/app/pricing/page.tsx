'use client'

import Link from 'next/link'
import { useState } from 'react'
import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'

export default function PricingPage() {
  const [annual, setAnnual] = useState(true)

  const plans = [
    {
      name: 'Starter',
      desc: 'Small teams getting started with structured onboarding.',
      monthlyPrice: 9,
      annualPrice: 7,
      featured: false,
      cta: 'Start free trial',
      features: [
        { label: 'Up to 10 active onboardees', yes: true },
        { label: 'All block types (video, text, quiz, flashcards)', yes: true },
        { label: 'Spaced repetition flashcards', yes: true },
        { label: 'Employee + manager dashboards', yes: true },
        { label: 'At-risk detection', yes: true },
        { label: 'Custom branding', yes: false },
        { label: 'Advanced reporting', yes: false },
        { label: 'Priority support', yes: false },
      ],
    },
    {
      name: 'Pro',
      desc: 'Growing teams that need unlimited onboarding capacity.',
      monthlyPrice: 15,
      annualPrice: 12,
      featured: true,
      cta: 'Start free trial',
      features: [
        { label: 'Unlimited active onboardees', yes: true },
        { label: 'All block types (video, text, quiz, flashcards)', yes: true },
        { label: 'Spaced repetition flashcards', yes: true },
        { label: 'Employee + manager dashboards', yes: true },
        { label: 'At-risk detection', yes: true },
        { label: 'Custom branding', yes: true },
        { label: 'Advanced reporting', yes: true },
        { label: 'Priority support', yes: true },
      ],
    },
    {
      name: 'Enterprise',
      desc: 'Large organisations with compliance and SSO requirements.',
      monthlyPrice: null,
      annualPrice: null,
      featured: false,
      cta: 'Contact sales',
      features: [
        { label: 'Everything in Pro', yes: true },
        { label: 'SSO / SAML', yes: true },
        { label: 'Dedicated customer success manager', yes: true },
        { label: 'Custom SLA', yes: true },
        { label: 'Audit logs', yes: true },
        { label: 'Custom integrations', yes: true },
        { label: 'On-premise option', yes: true },
        { label: 'Volume discounts', yes: true },
      ],
    },
  ]

  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh' }}>

      <MarketingNav activePage="Pricing" />

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 40px 56px', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 12px', borderRadius: 20, marginBottom: 20 }}>
          Simple pricing
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 400, lineHeight: 1.12, marginBottom: 16, color: '#0f0f0e' }}>
          Pay for what you use,<br /><em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>nothing more.</em>
        </h1>
        <p style={{ fontSize: 18, fontWeight: 300, color: '#3a3a38', marginBottom: 32 }}>
          Per active onboardee. Managers and admins are always free.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 56 }}>
          <span style={{ fontSize: 14, color: annual ? '#7a7a78' : '#0f0f0e', fontWeight: annual ? 400 : 500 }}>Monthly</span>
          <button onClick={() => setAnnual(!annual)} style={{ width: 44, height: 24, borderRadius: 12, background: '#1a5fd4', border: 'none', cursor: 'pointer', position: 'relative' }}>
            <div style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: 'white', top: 3, left: annual ? 23 : 3, transition: 'left .2s' }} />
          </button>
          <span style={{ fontSize: 14, color: annual ? '#0f0f0e' : '#7a7a78', fontWeight: annual ? 500 : 400 }}>Annual</span>
          <span style={{ fontSize: 11, fontWeight: 500, background: '#e2f4eb', color: '#177a4a', padding: '3px 10px', borderRadius: 20, border: '1px solid #9FE1CB' }}>Save 20%</span>
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 1000, margin: '0 auto 80px', padding: '0 40px' }}>
        {plans.map((plan, i) => (
          <div key={i} style={{ background: 'white', border: plan.featured ? '2px solid #1a5fd4' : '1px solid #e8e7e2', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {plan.featured && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#1a5fd4', color: 'white', fontSize: 11, fontWeight: 500, padding: '3px 14px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                Most popular
              </div>
            )}
            <div style={{ fontSize: 16, fontWeight: 500, color: '#0f0f0e', marginBottom: 4 }}>{plan.name}</div>
            <div style={{ fontSize: 13, color: '#7a7a78', marginBottom: 20, lineHeight: 1.5 }}>{plan.desc}</div>
            <div style={{ marginBottom: 6 }}>
              {plan.monthlyPrice ? (
                <>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: 42, fontWeight: 400, color: '#0f0f0e' }}>€{annual ? plan.annualPrice : plan.monthlyPrice}</span>
                  <span style={{ fontSize: 13, color: '#7a7a78' }}>/seat/mo</span>
                </>
              ) : (
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 400, color: '#0f0f0e' }}>Custom</span>
              )}
            </div>
            {plan.monthlyPrice && (
              <div style={{ fontSize: 12, color: '#b8b8b5', marginBottom: 20 }}>
                {annual ? `Billed €${plan.annualPrice! * 12}/seat/year` : 'Billed monthly'}
              </div>
            )}
            <div style={{ height: 1, background: '#e8e7e2', margin: '0 0 20px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, marginBottom: 24 }}>
              {plan.features.map((f, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: '#3a3a38' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: f.yes ? '#e2f4eb' : '#f2f1ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0, marginTop: 2, color: f.yes ? '#177a4a' : '#b8b8b5' }}>
                    {f.yes ? '✓' : '—'}
                  </div>
                  {f.label}
                </div>
              ))}
            </div>
            <Link href={plan.cta === 'Contact sales' ? '/contact' : '/signup'} style={{ display: 'block', textAlign: 'center', padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none', background: plan.featured ? '#1a5fd4' : 'transparent', color: plan.featured ? 'white' : '#3a3a38', border: plan.featured ? 'none' : '1px solid #e8e7e2' }}>
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 700, margin: '0 auto 80px', padding: '0 40px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, color: '#0f0f0e', marginBottom: 40, textAlign: 'center' }}>
          Common <em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>questions.</em>
        </h2>
        {[
          { q: 'What counts as an active onboardee?', a: 'An active onboardee is any employee with a currently running onboarding instance. Once their onboarding is completed or paused, they no longer count toward your seat count. Managers and admins are always free.' },
          { q: 'Can I switch plans later?', a: 'Yes, you can upgrade or downgrade at any time. If you upgrade mid-cycle, you\'ll be charged the prorated difference. If you downgrade, the credit applies to your next billing cycle.' },
          { q: 'What happens after the trial?', a: 'After 14 days you\'ll be asked to choose a plan. Your data is always preserved. If you don\'t choose a plan, your account goes into read-only mode — nothing is deleted.' },
          { q: 'Is there a setup fee?', a: 'No. There are no setup fees, no onboarding fees, and no hidden costs. You pay per active onboardee, per month.' },
        ].map((faq, i) => (
          <div key={i} style={{ borderBottom: '1px solid #e8e7e2', padding: '20px 0' }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#0f0f0e', marginBottom: 8 }}>{faq.q}</div>
            <div style={{ fontSize: 14, color: '#3a3a38', lineHeight: 1.6, fontWeight: 300 }}>{faq.a}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <section style={{ background: '#1a5fd4', padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, color: 'white', marginBottom: 16 }}>Start your free trial today.</h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,.8)', fontWeight: 300, maxWidth: 440, margin: '0 auto 32px' }}>14 days, full Pro access, no credit card required.</p>
        <Link href="/signup" style={{ fontSize: 16, fontWeight: 500, color: '#1a5fd4', background: 'white', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', display: 'inline-block' }}>
          Start free trial →
        </Link>
      </section>

      <MarketingFooter />
    </main>
  )
}