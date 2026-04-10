import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { renderCertificate } from '@/lib/certificate'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { instanceId } = await params

  const { data: instance } = await supabaseAdmin
    .from('OnboardingInstance')
    .select(`
      id, status, startDate, endDate,
      template:Template(name),
      company:Company(name, logoUrl, brandColor),
      employee:User!OnboardingInstance_employeeId_fkey(name)
    `)
    .eq('id', instanceId)
    .eq('status', 'completed')
    .single() as {
      data: {
        id: string; status: string; startDate: string; endDate: string | null;
        template: { name: string };
        company: { name: string; logoUrl: string | null; brandColor: string | null };
        employee: { name: string };
      } | null
    }

  if (!instance) {
    return NextResponse.json({ error: 'Niet gevonden of niet voltooid' }, { status: 404 })
  }

  // Verify manager has access to this instance (managerId or company_admin)
  const { data: access } = await supabaseAdmin
    .from('OnboardingInstance')
    .select('id')
    .eq('id', instanceId)
    .or(`managerId.eq.${session.id},companyId.eq.${session.companyId}`)
    .single()

  if (!access) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const pdfBuffer = await renderCertificate({
    employeeName: instance.employee.name,
    templateName: instance.template.name,
    companyName: instance.company.name,
    logoUrl: instance.company.logoUrl ?? null,
    brandColor: instance.company.brandColor ?? '#2563eb',
    completedAt: instance.endDate ?? instance.startDate,
  })

  const filename = `certificaat-${instance.employee.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
