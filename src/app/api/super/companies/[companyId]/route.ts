import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { companyId } = await params

  const [
    { data: company },
    { data: users },
    { data: templates },
    { data: onboardings },
  ] = await Promise.all([
    supabaseAdmin
      .from('Company')
      .select('id, name, slug, plan, status, createdAt, trialEndsAt, stripeCustomerId')
      .eq('id', companyId)
      .single(),

    supabaseAdmin
      .from('User')
      .select('id, name, email, role, createdAt')
      .eq('companyId', companyId)
      .order('createdAt'),

    supabaseAdmin
      .from('Template')
      .select('id, name, published, createdAt')
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false }),

    supabaseAdmin
      .from('OnboardingInstance')
      .select(`
        id, status, progressPct, startDate, createdAt,
        employee:User!OnboardingInstance_employeeId_fkey(name, email),
        template:Template(name)
      `)
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false })
      .limit(20),
  ])

  if (!company) return NextResponse.json({ error: 'Company niet gevonden' }, { status: 404 })

  return NextResponse.json({
    company,
    users: users ?? [],
    templates: templates ?? [],
    onboardings: (onboardings ?? []).map(o => {
      const emp = o.employee as unknown as { name: string; email: string } | null
      const tpl = o.template as unknown as { name: string } | null
      return {
        id: o.id,
        status: o.status,
        progressPct: o.progressPct,
        startDate: o.startDate,
        createdAt: o.createdAt,
        employeeName: emp?.name ?? '—',
        employeeEmail: emp?.email ?? '',
        templateName: tpl?.name ?? '—',
      }
    }),
  })
}

// PATCH: status, plan of trialEndsAt aanpassen
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { companyId } = await params
  const body = await req.json()

  const updates: Record<string, unknown> = {}

  if (body.status !== undefined) {
    const valid = ['trial', 'active', 'paused', 'cancelled']
    if (!valid.includes(body.status)) {
      return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 })
    }
    updates.status = body.status
  }

  if (body.plan !== undefined) {
    const valid = ['starter', 'pro', 'enterprise']
    if (!valid.includes(body.plan)) {
      return NextResponse.json({ error: 'Ongeldig plan' }, { status: 400 })
    }
    updates.plan = body.plan
  }

  if (body.extendTrial === true) {
    const { data: company } = await supabaseAdmin
      .from('Company')
      .select('trialEndsAt')
      .eq('id', companyId)
      .single()

    const base = company?.trialEndsAt ? new Date(company.trialEndsAt) : new Date()
    if (base < new Date()) base.setTime(new Date().getTime())
    base.setDate(base.getDate() + 14)
    updates.trialEndsAt = base.toISOString()
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Niets om bij te werken' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('Company')
    .update(updates)
    .eq('id', companyId)

  if (error) return NextResponse.json({ error: 'Kon niet bijwerken' }, { status: 500 })

  await logAudit('plan_change', session.id, companyId, { updates })

  return NextResponse.json({ success: true, updates })
}

// POST: nieuwe gebruiker aanmaken + uitnodigingsmail
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { companyId } = await params
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
    .eq('id', companyId)
    .single()

  if (!company) return NextResponse.json({ error: 'Company niet gevonden' }, { status: 404 })

  // Maak user aan (of vind bestaande)
  const normalizedEmail = email.toLowerCase().trim()
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
      .update({ name: name.trim(), role, companyId })
      .eq('id', userId)
  } else {
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('User')
      .insert({ name: name.trim(), email: normalizedEmail, role, companyId })
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

  const loginUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`
  const roleLabel: Record<string, string> = {
    employee: 'Medewerker',
    manager: 'Manager',
    company_admin: 'Beheerder',
  }

  await resend.emails.send({
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

  return NextResponse.json({ success: true, userId })
}
