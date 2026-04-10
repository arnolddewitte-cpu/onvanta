import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'company_admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { action } = await req.json()
  if (action !== 'pause' && action !== 'resume') {
    return NextResponse.json({ error: 'Ongeldige actie' }, { status: 400 })
  }

  const newCompanyStatus = action === 'pause' ? 'paused' : 'active'

  const { error: companyError } = await supabaseAdmin
    .from('Company')
    .update({ status: newCompanyStatus })
    .eq('id', session.companyId)

  if (companyError) {
    return NextResponse.json({ error: 'Kon status niet bijwerken' }, { status: 500 })
  }

  if (action === 'pause') {
    await supabaseAdmin
      .from('OnboardingInstance')
      .update({ status: 'paused' })
      .eq('companyId', session.companyId)
      .in('status', ['active', 'at_risk'])
  } else {
    await supabaseAdmin
      .from('OnboardingInstance')
      .update({ status: 'active' })
      .eq('companyId', session.companyId)
      .eq('status', 'paused')
  }

  return NextResponse.json({ success: true, status: newCompanyStatus })
}
