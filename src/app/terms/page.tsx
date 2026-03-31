import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'

export default function TermsPage() {
  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh' }}>

      <MarketingNav />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 40px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 12px', borderRadius: 20, marginBottom: 20 }}>
            Legal
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.12, color: '#0f0f0e', marginBottom: 12 }}>Terms of Service</h1>
          <p style={{ fontSize: 14, color: '#7a7a78' }}>Last updated: March 2026</p>
        </div>

        {[
          {
            title: '1. Acceptance of terms',
            content: 'By creating an account or using the Onvanta platform, you agree to these Terms of Service. If you are using Onvanta on behalf of a company, you represent that you have the authority to bind that company to these terms.'
          },
          {
            title: '2. Description of service',
            content: 'Onvanta is a SaaS platform for employee onboarding and knowledge retention. We provide tools for creating onboarding templates, tracking employee progress, and delivering spaced repetition training. We reserve the right to modify or discontinue any part of the service with reasonable notice.'
          },
          {
            title: '3. Account and access',
            content: 'You are responsible for maintaining the security of your account. You must provide accurate information when creating your account. Each account is for use by a single organisation. You may not share your account credentials with third parties outside your organisation.'
          },
          {
            title: '4. Subscription and payment',
            content: 'Onvanta is offered on a subscription basis. Pricing is per active onboardee per month. Managers and admins are always free. Subscriptions are billed monthly or annually depending on your chosen plan. You may cancel at any time. After cancellation, your account enters read-only mode and your data is retained for 30 days.'
          },
          {
            title: '5. Free trial',
            content: 'New accounts receive a 14-day free trial with full Pro access. No credit card is required to start a trial. At the end of the trial period, you may choose a paid plan or your account will enter read-only mode. Your data is never deleted without explicit request.'
          },
          {
            title: '6. Your content',
            content: 'You retain ownership of all content you create in Onvanta, including onboarding templates, training materials, and company information. By uploading content, you grant Onvanta a limited licence to store and display that content to users within your organisation. We will never share your content with other organisations.'
          },
          {
            title: '7. Acceptable use',
            content: 'You may not use Onvanta to violate any laws or regulations, to harass or harm any person, to upload malicious code or content, or to attempt to gain unauthorised access to our systems. We reserve the right to suspend or terminate accounts that violate these terms.'
          },
          {
            title: '8. Limitation of liability',
            content: 'Onvanta is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim.'
          },
          {
            title: '9. Governing law',
            content: 'These terms are governed by Dutch law. Any disputes will be subject to the exclusive jurisdiction of the courts of the Netherlands.'
          },
          {
            title: '10. Contact',
            content: 'For questions about these terms, contact us at hello@onvanta.io.'
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400, color: '#0f0f0e', marginBottom: 12 }}>{section.title}</h2>
            <p style={{ fontSize: 15, color: '#3a3a38', lineHeight: 1.8, fontWeight: 300 }}>{section.content}</p>
          </div>
        ))}
      </div>

      <MarketingFooter />
    </main>
  )
}