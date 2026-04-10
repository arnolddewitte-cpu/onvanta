import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'company_admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { confirm } = await req.json()

  // Verify company name matches
  const { data: company } = await supabaseAdmin
    .from('Company')
    .select('id, name')
    .eq('id', session.companyId)
    .single()

  if (!company) {
    return NextResponse.json({ error: 'Bedrijf niet gevonden' }, { status: 404 })
  }

  if (confirm !== company.name) {
    return NextResponse.json({ error: 'Bedrijfsnaam komt niet overeen' }, { status: 400 })
  }

  const companyId = session.companyId

  // Get all onboarding instance IDs for this company
  const { data: instances } = await supabaseAdmin
    .from('OnboardingInstance')
    .select('id')
    .eq('companyId', companyId)

  const instanceIds = (instances ?? []).map(i => i.id)

  // Delete in dependency order
  if (instanceIds.length > 0) {
    await supabaseAdmin.from('FlashcardReview').delete().in('instanceId', instanceIds)
    await supabaseAdmin.from('Task').delete().in('instanceId', instanceIds)
    await supabaseAdmin.from('StepProgress').delete().in('instanceId', instanceIds)
  }

  await supabaseAdmin.from('OnboardingInstance').delete().eq('companyId', companyId)

  // Get template IDs for this company
  const { data: templates } = await supabaseAdmin
    .from('Template')
    .select('id')
    .eq('companyId', companyId)

  const templateIds = (templates ?? []).map(t => t.id)

  if (templateIds.length > 0) {
    const { data: phases } = await supabaseAdmin
      .from('TemplatePhase')
      .select('id')
      .in('templateId', templateIds)

    const phaseIds = (phases ?? []).map(p => p.id)

    if (phaseIds.length > 0) {
      const { data: steps } = await supabaseAdmin
        .from('TemplateStep')
        .select('id')
        .in('phaseId', phaseIds)

      const stepIds = (steps ?? []).map(s => s.id)

      if (stepIds.length > 0) {
        await supabaseAdmin.from('StepBlock').delete().in('stepId', stepIds)
      }

      await supabaseAdmin.from('TemplateStep').delete().in('phaseId', phaseIds)
    }

    await supabaseAdmin.from('TemplatePhase').delete().in('templateId', templateIds)
  }

  await supabaseAdmin.from('Template').delete().eq('companyId', companyId)

  // Optional tables that may exist
  try { await supabaseAdmin.from('AuditLog').delete().eq('companyId', companyId) } catch { /* table may not exist */ }
  try { await supabaseAdmin.from('FeatureFlag').delete().eq('companyId', companyId) } catch { /* table may not exist */ }

  await supabaseAdmin.from('User').delete().eq('companyId', companyId)
  await supabaseAdmin.from('Company').delete().eq('id', companyId)

  // Clear session cookie
  const cookieStore = await cookies()
  cookieStore.delete('next-auth.session-token')

  return NextResponse.json({ success: true })
}
