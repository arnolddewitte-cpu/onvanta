import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

const AT_RISK_DAYS_INACTIVE = 3
const AT_RISK_OVERDUE_COUNT = 3
const NOTIFY_COOLDOWN_DAYS = 7

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true
  return auth === `Bearer ${cronSecret}`
}

function buildAtRiskEmail({
  managerName,
  employeeName,
  reason,
  detailLine,
  instanceUrl,
}: {
  managerName: string
  employeeName: string
  reason: string
  detailLine: string
  instanceUrl: string
}): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'DM Sans',system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #e8e7e2">

        <!-- Header -->
        <tr>
          <td style="background:#1a5fd4;padding:28px 36px">
            <span style="font-family:Georgia,serif;font-size:22px;color:white;font-weight:400">Onvanta</span>
          </td>
        </tr>

        <!-- Warning banner -->
        <tr>
          <td style="background:#fef3cd;border-bottom:1px solid #fde68a;padding:14px 36px">
            <span style="font-size:14px;color:#92400e;font-weight:500">⚠️ Medewerker heeft aandacht nodig</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 36px">
            <p style="font-size:15px;color:#3a3a38;margin:0 0 20px">Hoi ${managerName},</p>
            <p style="font-size:15px;color:#3a3a38;margin:0 0 24px">
              <strong>${employeeName}</strong> is as-risk gegaan tijdens hun onboarding:
            </p>

            <!-- Reason card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef9f0;border:1px solid #fde68a;border-radius:12px;margin-bottom:28px">
              <tr>
                <td style="padding:20px 24px">
                  <p style="font-size:14px;font-weight:600;color:#92400e;margin:0 0 6px">${reason}</p>
                  <p style="font-size:13px;color:#78350f;margin:0">${detailLine}</p>
                </td>
              </tr>
            </table>

            <p style="font-size:14px;color:#7a7a78;margin:0 0 24px">
              Check de voortgang van ${employeeName} en neem contact op als ze ergens vastzitten.
            </p>

            <!-- CTA button -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1a5fd4;border-radius:10px">
                  <a href="${instanceUrl}" style="display:inline-block;padding:13px 24px;font-size:14px;font-weight:500;color:white;text-decoration:none">
                    Bekijk ${employeeName} →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid #f0f0ed;padding:20px 36px">
            <p style="font-size:12px;color:#b8b8b5;margin:0">
              Je ontvangt deze melding als manager in Onvanta. Maximaal één keer per week per medewerker.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Ongeautoriseerd' }, { status: 401 })
  }

  const now = new Date()
  const cooldownCutoff = new Date(now.getTime() - NOTIFY_COOLDOWN_DAYS * 86400000).toISOString()
  const baseUrl = process.env.NEXTAUTH_URL ?? `https://${process.env.VERCEL_URL}`

  // Haal alle actieve/at_risk instances op met manager en employee info
  const { data: instances, error: instErr } = await supabaseAdmin
    .from('OnboardingInstance')
    .select(`
      id, status, createdAt, atRiskNotifiedAt,
      employee:User!OnboardingInstance_employeeId_fkey(id, name),
      manager:User!OnboardingInstance_managerId_fkey(id, name, email)
    `)
    .in('status', ['active', 'at_risk'])
    .not('managerId', 'is', null) as {
      data: Array<{
        id: string
        status: string
        createdAt: string
        atRiskNotifiedAt: string | null
        employee: { id: string; name: string }
        manager: { id: string; name: string; email: string }
      }> | null
      error: unknown
    }

  if (instErr) {
    console.error('[at-risk] instance fetch error:', instErr)
    return NextResponse.json({ error: 'DB fout' }, { status: 500 })
  }

  if (!instances?.length) {
    return NextResponse.json({ notified: 0, message: 'Geen actieve onboardings' })
  }

  const instanceIds = instances.map(i => i.id)

  // Laatste activiteit per instance
  const { data: progressRows } = await supabaseAdmin
    .from('StepProgress')
    .select('instanceId, completedAt')
    .in('instanceId', instanceIds)
    .eq('completed', true)

  const lastActivityByInstance: Record<string, string | null> = {}
  for (const row of progressRows ?? []) {
    const current = lastActivityByInstance[row.instanceId]
    if (!current || (row.completedAt && row.completedAt > current)) {
      lastActivityByInstance[row.instanceId] = row.completedAt
    }
  }

  // Overdue taken per instance
  const { data: overdueTasks } = await supabaseAdmin
    .from('Task')
    .select('instanceId')
    .in('instanceId', instanceIds)
    .eq('status', 'overdue')

  const overdueByInstance: Record<string, number> = {}
  for (const task of overdueTasks ?? []) {
    overdueByInstance[task.instanceId] = (overdueByInstance[task.instanceId] ?? 0) + 1
  }

  const results: { instanceId: string; employee: string; manager: string; notified: boolean; reason?: string; skipped?: string }[] = []

  for (const instance of instances) {
    const lastActivity = lastActivityByInstance[instance.id] ?? null
    const overdueCount = overdueByInstance[instance.id] ?? 0

    const daysSinceActivity = lastActivity
      ? Math.floor((now.getTime() - new Date(lastActivity).getTime()) / 86400000)
      : Math.floor((now.getTime() - new Date(instance.createdAt).getTime()) / 86400000)

    const inactiveAtRisk = daysSinceActivity >= AT_RISK_DAYS_INACTIVE
    const overdueAtRisk = overdueCount >= AT_RISK_OVERDUE_COUNT
    const isAtRisk = inactiveAtRisk || overdueAtRisk

    if (!isAtRisk) {
      results.push({ instanceId: instance.id, employee: instance.employee.name, manager: instance.manager.name, notified: false, skipped: 'niet at-risk' })
      continue
    }

    // Cooldown check: niet notificeren als al binnen 7 dagen gestuurd
    if (instance.atRiskNotifiedAt && instance.atRiskNotifiedAt > cooldownCutoff) {
      results.push({ instanceId: instance.id, employee: instance.employee.name, manager: instance.manager.name, notified: false, skipped: `cooldown (laatste notificatie: ${instance.atRiskNotifiedAt})` })
      continue
    }

    // Bepaal reden
    let reason: string
    let detailLine: string
    if (inactiveAtRisk && overdueAtRisk) {
      reason = 'Inactief én overdue taken'
      detailLine = `${daysSinceActivity} dagen niet actief en ${overdueCount} overdue taken.`
    } else if (inactiveAtRisk) {
      reason = 'Al een tijdje niet ingelogd'
      detailLine = `${instance.employee.name} is ${daysSinceActivity} dagen niet actief geweest in de onboarding.`
    } else {
      reason = 'Overdue taken'
      detailLine = `${instance.employee.name} heeft ${overdueCount} overdue taken staan.`
    }

    const instanceUrl = `${baseUrl}/manager/${instance.id}`

    console.log(`[at-risk] stuur notificatie → ${instance.manager.email} voor ${instance.employee.name} (${reason})`)

    try {
      await resend.emails.send({
        from: 'Onvanta <noreply@onvanta.io>',
        to: instance.manager.email,
        subject: `⚠️ ${instance.employee.name} heeft aandacht nodig`,
        html: buildAtRiskEmail({
          managerName: instance.manager.name.split(' ')[0],
          employeeName: instance.employee.name,
          reason,
          detailLine,
          instanceUrl,
        }),
      })

      // Update atRiskNotifiedAt
      await supabaseAdmin
        .from('OnboardingInstance')
        .update({ atRiskNotifiedAt: now.toISOString(), status: 'at_risk' })
        .eq('id', instance.id)

      results.push({ instanceId: instance.id, employee: instance.employee.name, manager: instance.manager.name, notified: true, reason })
    } catch (err) {
      console.error(`[at-risk] email fout voor ${instance.employee.name}:`, err)
      results.push({ instanceId: instance.id, employee: instance.employee.name, manager: instance.manager.name, notified: false, skipped: 'email fout' })
    }
  }

  const notifiedCount = results.filter(r => r.notified).length
  console.log('[at-risk] voltooid:', { total: results.length, notified: notifiedCount })

  return NextResponse.json({ notified: notifiedCount, total: results.length, results })
}

export async function GET(req: NextRequest) {
  return POST(req)
}
