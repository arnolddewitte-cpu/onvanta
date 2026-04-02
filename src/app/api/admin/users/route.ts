import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

// GET — alle gebruikers in de company (ook voor onboarding new page manager-select)
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const url = new URL(req.url)
  const managersOnly = url.searchParams.get('managers') === '1'

  let query = supabaseAdmin
    .from('User')
    .select('id, name, email, role, createdAt')
    .eq('companyId', session.companyId)
    .order('createdAt', { ascending: false })

  if (managersOnly) {
    query = query.in('role', ['manager', 'company_admin'])
  }

  const { data: users, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Kon gebruikers niet ophalen' }, { status: 500 })
  }

  return NextResponse.json(users ?? [])
}

// POST — gebruiker uitnodigen
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || !['company_admin', 'manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { name, email, role } = await req.json()

  if (!name?.trim() || !email?.trim() || !role) {
    return NextResponse.json({ error: 'Naam, email en rol zijn verplicht' }, { status: 400 })
  }

  const validRoles = ['employee', 'manager', 'company_admin']
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: 'Ongeldige rol' }, { status: 400 })
  }

  const { data: company } = await supabaseAdmin
    .from('Company')
    .select('name')
    .eq('id', session.companyId)
    .single()

  if (!company) return NextResponse.json({ error: 'Bedrijf niet gevonden' }, { status: 404 })

  const normalizedEmail = email.toLowerCase().trim()

  // Vind bestaande gebruiker of maak nieuwe aan
  const { data: existing } = await supabaseAdmin
    .from('User')
    .select('id')
    .eq('email', normalizedEmail)
    .single()

  let userId: string

  if (existing) {
    userId = existing.id
    await supabaseAdmin
      .from('User')
      .update({ name: name.trim(), role, companyId: session.companyId })
      .eq('id', userId)
  } else {
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('User')
      .insert({ name: name.trim(), email: normalizedEmail, role, companyId: session.companyId })
      .select('id')
      .single()

    if (userError || !newUser) {
      console.error('User insert error:', userError)
      return NextResponse.json({ error: 'Kon gebruiker niet aanmaken' }, { status: 500 })
    }
    userId = newUser.id
  }

  // Magic link token (7 dagen)
  const token = crypto.randomUUID()
  await supabaseAdmin.from('MagicLinkToken').insert({
    token,
    userId,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    used: false,
  })

  const baseUrl = process.env.NEXTAUTH_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://onvanta.io')
  const loginUrl = `${baseUrl}/api/auth/verify?token=${token}`
  const roleLabel: Record<string, string> = {
    employee: 'Medewerker',
    manager: 'Manager',
    company_admin: 'Beheerder',
  }

  const { error: mailError } = await resend.emails.send({
    from: 'Onvanta <noreply@onvanta.io>',
    to: normalizedEmail,
    subject: `Je bent uitgenodigd voor ${company.name} op Onvanta`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:DM Sans,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e8e7e2;overflow:hidden;">
        <tr><td style="background:#1a5fd4;padding:28px 36px;">
          <p style="margin:0;color:#fff;font-size:20px;font-weight:600;">Onvanta</p>
        </td></tr>
        <tr><td style="padding:36px;">
          <p style="margin:0 0 16px;font-size:16px;color:#0f0f0e;">Hallo ${name.trim()},</p>
          <p style="margin:0 0 16px;font-size:15px;color:#3a3a38;line-height:1.6;">
            Je bent uitgenodigd om deel te nemen aan <strong>${company.name}</strong> op Onvanta als <strong>${roleLabel[role]}</strong>.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
            <tr><td style="background:#1a5fd4;border-radius:10px;">
              <a href="${loginUrl}" style="display:inline-block;padding:14px 28px;color:#fff;font-size:15px;font-weight:600;text-decoration:none;">
                Inloggen bij Onvanta →
              </a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#9ca3af;">Deze link is 7 dagen geldig.</p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:16px 36px;border-top:1px solid #e8e7e2;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Onvanta</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
    `.trim(),
  })

  if (mailError) {
    console.error('Resend error:', mailError)
    return NextResponse.json({ error: 'Gebruiker aangemaakt maar mail mislukt' }, { status: 500 })
  }

  return NextResponse.json({ success: true, userId })
}
