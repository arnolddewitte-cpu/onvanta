import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import {
  buildEmailHeader,
  buildWelcomeBlock,
  buildCtaButton,
  resolveColor,
  resolveSender,
  type CompanyBranding,
} from '@/lib/email-branding'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST() {
  const session = await getSession()
  if (!session || !['company_admin', 'manager', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { data: company } = await supabaseAdmin
    .from('Company')
    .select('name, logoUrl, senderName, welcomeMessage, brandColor')
    .eq('id', session.companyId)
    .single()

  if (!company) return NextResponse.json({ error: 'Bedrijf niet gevonden' }, { status: 404 })

  const { data: user } = await supabaseAdmin
    .from('User')
    .select('name, email')
    .eq('id', session.id)
    .single()

  if (!user) return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })

  const branding: CompanyBranding = {
    companyName: company.name,
    logoUrl: company.logoUrl,
    senderName: company.senderName,
    welcomeMessage: company.welcomeMessage,
    brandColor: company.brandColor,
  }

  const color = resolveColor(branding)
  const sender = resolveSender(branding)
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://onvanta.io'

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

        ${buildEmailHeader(branding)}

        <tr>
          <td style="padding:32px 40px 8px;">
            <p style="margin:0 0 6px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;">Voorbeeld uitnodigingsmail</p>
            <p style="margin:0 0 20px;font-size:16px;color:#111827;">Hallo ${user.name},</p>
            <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
              Je bent uitgenodigd om te starten met je onboarding bij <strong>${company.name}</strong>.
            </p>
          </td>
        </tr>

        ${buildWelcomeBlock(branding)}

        <tr>
          <td style="padding:8px 40px 32px;">
            ${buildCtaButton('Start mijn onboarding →', `${baseUrl}/dashboard`, color)}
            <p style="margin:0;font-size:13px;color:#9ca3af;">
              Deze link is 7 dagen geldig.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#f9fafb;padding:16px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Verstuurd via Onvanta &middot; Dit bericht is verstuurd door ${sender}</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  const { error } = await resend.emails.send({
    from: `${sender} <noreply@onvanta.io>`,
    to: user.email,
    subject: `[Testmail] Welkom bij ${company.name} — je toegangslink staat klaar`,
    html,
  })

  if (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ error: 'Versturen mislukt' }, { status: 500 })
  }

  return NextResponse.json({ success: true, sentTo: user.email })
}
