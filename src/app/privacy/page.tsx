import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'

export default function PrivacyPage() {
  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh' }}>

      <MarketingNav />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 40px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 12px', borderRadius: 20, marginBottom: 20 }}>
            Legal
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.12, color: '#0f0f0e', marginBottom: 12 }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: '#7a7a78' }}>Last updated: March 2026</p>
        </div>

        {[
          {
            title: '1. Who we are',
            content: 'Onvanta is an employee onboarding and knowledge retention platform. This privacy policy explains how we collect, use, and protect your personal data when you use our services. Our platform is operated from the Netherlands and we are subject to Dutch and European data protection law (GDPR).'
          },
          {
            title: '2. What data we collect',
            content: 'We collect the following personal data: name and work email address (required to create an account), company name and team size (provided during signup), usage data such as login timestamps, onboarding progress, quiz scores, and flashcard review results, and technical data such as IP address, browser type, and device information.'
          },
          {
            title: '3. How we use your data',
            content: 'We use your data to provide and improve the Onvanta service, to send transactional emails such as magic link login emails and onboarding notifications, to give managers and admins visibility into onboarding progress, and to analyse usage patterns to improve the product. We do not sell your data to third parties. We do not use your data for advertising purposes.'
          },
          {
            title: '4. Data storage and security',
            content: 'Your data is stored in Supabase (PostgreSQL) on servers located in Frankfurt, Germany (EU). We use industry-standard security measures including encrypted connections (HTTPS), hashed tokens for authentication, and role-based access controls. We retain your data for as long as your account is active. After account deletion, data is removed within 30 days.'
          },
          {
            title: '5. Third-party services',
            content: 'We use the following third-party services: Supabase (database and authentication, EU servers), Resend (transactional email), Vercel (hosting and deployment), and Stripe (payment processing). Each of these services has their own privacy policy and data processing agreements in place.'
          },
          {
            title: '6. Your rights (GDPR)',
            content: 'Under GDPR, you have the right to access your personal data, correct inaccurate data, request deletion of your data, export your data in a portable format, and object to or restrict processing. To exercise any of these rights, contact us at hello@onvanta.io. We will respond within 30 days.'
          },
          {
            title: '7. Cookies',
            content: 'We use a session cookie (next-auth.session-token) to keep you logged in. This cookie is strictly necessary for the service to function and does not track you across other websites. We do not use advertising or analytics cookies.'
          },
          {
            title: '8. Contact',
            content: 'If you have questions about this privacy policy or how we handle your data, contact us at hello@onvanta.io.'
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