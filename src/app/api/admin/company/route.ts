import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session || !['company_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { data: company } = await supabaseAdmin
    .from('Company')
    .select('id, name, slug, plan, status, trialEndsAt, stripeCustomerId, logoUrl, senderName, welcomeMessage, brandColor, locale')
    .eq('id', session.companyId)
    .single()

  if (!company) return NextResponse.json({ error: 'Bedrijf niet gevonden' }, { status: 404 })

  return NextResponse.json(company)
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || !['company_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const body = await req.json()
  const allowed = ['name', 'senderName', 'welcomeMessage', 'brandColor', 'logoUrl', 'locale']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Niets om bij te werken' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('Company')
    .update(updates)
    .eq('id', session.companyId)

  if (error) return NextResponse.json({ error: 'Kon niet opslaan' }, { status: 500 })

  return NextResponse.json({ success: true })
}
