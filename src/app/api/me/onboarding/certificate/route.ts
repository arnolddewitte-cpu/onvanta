import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { renderCertificate } from '@/lib/certificate'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data: instance } = await supabaseAdmin
    .from('OnboardingInstance')
    .select(`
      id, status, startDate, endDate,
      template:Template(name),
      company:Company(name, logoUrl, brandColor)
    `)
    .eq('employeeId', session.id)
    .eq('status', 'completed')
    .order('endDate', { ascending: false })
    .limit(1)
    .single() as {
      data: {
        id: string; status: string; startDate: string; endDate: string | null;
        template: { name: string };
        company: { name: string; logoUrl: string | null; brandColor: string | null };
      } | null
    }

  if (!instance) {
    return NextResponse.json({ error: 'Geen voltooide onboarding gevonden' }, { status: 404 })
  }

  const { data: user } = await supabaseAdmin
    .from('User')
    .select('name')
    .eq('id', session.id)
    .single()

  const pdfBuffer = await renderCertificate({
    employeeName: user?.name ?? session.email,
    templateName: instance.template.name,
    companyName: instance.company.name,
    logoUrl: instance.company.logoUrl ?? null,
    brandColor: instance.company.brandColor ?? '#2563eb',
    completedAt: instance.endDate ?? instance.startDate,
  })

  const filename = `certificaat-${instance.template.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
