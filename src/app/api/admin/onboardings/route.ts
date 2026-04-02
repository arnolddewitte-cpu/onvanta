import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { employeeName, employeeEmail, role, templateId, managerId, startDate } = await req.json()

    if (!employeeName?.trim() || !employeeEmail?.trim() || !templateId || !startDate) {
      return NextResponse.json({ error: 'Verplichte velden ontbreken' }, { status: 400 })
    }

    const email = employeeEmail.toLowerCase().trim()

    // 1. Haal companyId op van het template
    const { data: template, error: templateError } = await supabaseAdmin
      .from('Template')
      .select('id, name, companyId')
      .eq('id', templateId)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template niet gevonden' }, { status: 404 })
    }

    // 2. Maak employee aan of vind bestaande user
    let employeeId: string

    const { data: existingUser } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      employeeId = existingUser.id
    } else {
      const { data: newUser, error: userError } = await supabaseAdmin
        .from('User')
        .insert({
          email,
          name: employeeName.trim(),
          role: 'employee',
          companyId: template.companyId,
        })
        .select('id')
        .single()

      if (userError || !newUser) {
        console.error('User insert error:', userError)
        return NextResponse.json({ error: 'Kon medewerker niet aanmaken' }, { status: 500 })
      }

      employeeId = newUser.id
    }

    // 3. Maak OnboardingInstance aan
    const { data: instance, error: instanceError } = await supabaseAdmin
      .from('OnboardingInstance')
      .insert({
        templateId,
        employeeId,
        managerId: managerId || null,
        companyId: template.companyId,
        status: 'active',
        startDate: new Date(startDate).toISOString(),
        progressPct: 0,
      })
      .select('id')
      .single()

    if (instanceError || !instance) {
      console.error('Instance insert error:', instanceError)
      return NextResponse.json({ error: 'Kon onboarding niet aanmaken' }, { status: 500 })
    }

    // 4. Genereer magic link token (7 dagen geldig voor uitnodigingen)
    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await supabaseAdmin.from('MagicLinkToken').insert({
      token,
      userId: employeeId,
      expires,
      used: false,
    })

    // 5. Stuur uitnodigingsmail
    const baseUrl = process.env.NEXTAUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://onvanta.io')
  const loginUrl = `${baseUrl}/api/auth/verify?token=${token}`
    const managerName = managerId ? await getManagerName(managerId) : null

    await resend.emails.send({
      from: 'Onvanta <noreply@onvanta.io>',
      to: email,
      subject: `Welkom bij ${template.name} — start je onboarding`,
      html: buildInviteEmail({
        employeeName: employeeName.trim(),
        templateName: template.name,
        managerName,
        startDate,
        loginUrl,
        role: role?.trim() || null,
      }),
    })

    await logAudit('onboarding_start', employeeId, template.companyId, {
      instanceId: instance.id,
      templateId,
      templateName: template.name,
      employeeEmail: email,
    })

    return NextResponse.json({ id: instance.id }, { status: 201 })

  } catch (err) {
    console.error('Create onboarding error:', err)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}

async function getManagerName(managerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('User')
    .select('name')
    .eq('id', managerId)
    .single()
  return data?.name ?? null
}

function buildInviteEmail({
  employeeName,
  templateName,
  managerName,
  startDate,
  loginUrl,
  role,
}: {
  employeeName: string
  templateName: string
  managerName: string | null
  startDate: string
  loginUrl: string
  role: string | null
}) {
  const formattedDate = new Date(startDate).toLocaleDateString('nl-NL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

        <!-- Header -->
        <tr>
          <td style="background:#2563eb;padding:32px 40px;">
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Onvanta</p>
            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Jouw onboarding staat klaar</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 16px;font-size:16px;color:#111827;">Hallo ${employeeName},</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
              Welkom! Je onboarding programma <strong>${templateName}</strong> staat voor je klaar${role ? ` voor je functie als <strong>${role}</strong>` : ''}.
              ${managerName ? `Je begeleider is <strong>${managerName}</strong>.` : ''}
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;">
              Je startdatum is <strong>${formattedDate}</strong>.
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr>
                <td style="background:#2563eb;border-radius:10px;">
                  <a href="${loginUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                    Start je onboarding →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">
              Deze link is 7 dagen geldig. Daarna kun je een nieuwe inloglink aanvragen op <a href="${process.env.NEXTAUTH_URL}/login" style="color:#2563eb;">onvanta.io/login</a>.
            </p>
            <p style="margin:0;font-size:13px;color:#9ca3af;">
              Als je dit niet verwachtte, kun je deze e-mail negeren.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Onvanta · Alle rechten voorbehouden</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim()
}
