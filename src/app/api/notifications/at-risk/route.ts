import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'
import { buildEmailHeader, buildCtaButton, resolveColor } from '@/lib/email-branding'

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

// ─── At-risk e-mail ───────────────────────────────────────────────────────────

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

// ─── Weekly digest e-mail ─────────────────────────────────────────────────────

interface DigestRow {
  instanceId: string
  employeeName: string
  templateName: string
  progressPct: number
  status: string
  daysActive: number
}

function buildProgressBar(pct: number, color: string): string {
  const filled = Math.round(pct / 5) * 5 // snap to 5% for cleaner rendering
  return `
    <table width="120" cellpadding="0" cellspacing="0" style="display:inline-table">
      <tr>
        <td style="background:#e8e7e2;border-radius:4px;height:6px;width:120px;overflow:hidden">
          <div style="width:${filled}%;height:6px;background:${color};border-radius:4px"></div>
        </td>
      </tr>
    </table>`
}

function buildDigestEmail({
  managerFirstName,
  rows,
  teamUrl,
  branding,
}: {
  managerFirstName: string
  rows: DigestRow[]
  teamUrl: string
  branding: { companyName: string; logoUrl?: string | null; senderName?: string | null; brandColor?: string | null }
}): string {
  const color = resolveColor(branding)
  const header = buildEmailHeader(branding)
  const cta = buildCtaButton('Bekijk je team →', teamUrl, color)

  const atRisk = rows.filter(r => r.status === 'at_risk')
  const onTrack = rows.filter(r => r.status !== 'at_risk')
  const sorted = [...atRisk, ...onTrack]

  const rowsHtml = sorted.map(r => {
    const isRisk = r.status === 'at_risk'
    const badge = isRisk
      ? `<span style="display:inline-block;background:#fef3cd;color:#92400e;font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;white-space:nowrap">At-risk</span>`
      : `<span style="display:inline-block;background:#d1fae5;color:#065f46;font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;white-space:nowrap">Op schema</span>`

    return `
    <tr style="border-bottom:1px solid #f0f0ed">
      <td style="padding:14px 0;vertical-align:top;width:36px">
        <div style="width:32px;height:32px;border-radius:50%;background:${isRisk ? '#fef3cd' : '#eff6ff'};display:flex;align-items:center;justify-content:center;font-weight:600;font-size:12px;color:${isRisk ? '#92400e' : color}">
          ${r.employeeName.charAt(0)}
        </div>
      </td>
      <td style="padding:14px 12px;vertical-align:top">
        <p style="margin:0 0 1px;font-size:13px;font-weight:600;color:#111827">${r.employeeName}</p>
        <p style="margin:0;font-size:11px;color:#9ca3af">${r.templateName} &middot; dag ${r.daysActive}</p>
      </td>
      <td style="padding:14px 0;vertical-align:middle;text-align:right;white-space:nowrap">
        <span style="font-size:12px;font-weight:600;color:${color};margin-right:8px">${r.progressPct}%</span>
        ${buildProgressBar(r.progressPct, color)}
      </td>
      <td style="padding:14px 0 14px 12px;vertical-align:middle;text-align:right">
        ${badge}
      </td>
    </tr>`
  }).join('')

  const atRiskCount = atRisk.length
  const atRiskNote = atRiskCount > 0
    ? `<tr><td style="padding:0 40px 20px"><div style="background:#fef3cd;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;font-size:13px;color:#92400e">⚠️ <strong>${atRiskCount} medewerker${atRiskCount > 1 ? 's' : ''}</strong> ${atRiskCount > 1 ? 'hebben' : 'heeft'} aandacht nodig. Ze staan bovenaan.</div></td></tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'DM Sans',system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:40px 0">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #e8e7e2">

        ${header}

        <!-- Title row -->
        <tr>
          <td style="padding:28px 40px 8px">
            <p style="margin:0 0 4px;font-size:18px;font-weight:600;color:#111827">Hoi ${managerFirstName},</p>
            <p style="margin:0;font-size:14px;color:#6b7280">Hier is het wekelijks overzicht van jouw team.</p>
          </td>
        </tr>

        ${atRiskNote}

        <!-- Team table -->
        <tr>
          <td style="padding:8px 40px 24px">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${rowsHtml}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 32px">
            ${cta}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid #f0f0ed;padding:20px 40px">
            <p style="font-size:12px;color:#b8b8b5;margin:0">
              Je ontvangt dit overzicht elke maandag als manager in Onvanta.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Digest runner ────────────────────────────────────────────────────────────

async function runWeeklyDigest(now: Date, baseUrl: string): Promise<{ sent: number; managers: number }> {
  // Fetch all active/at_risk instances with template and company branding
  const { data: instances } = await supabaseAdmin
    .from('OnboardingInstance')
    .select(`
      id, status, progressPct, startDate,
      employee:User!OnboardingInstance_employeeId_fkey(id, name),
      manager:User!OnboardingInstance_managerId_fkey(id, name, email),
      template:Template(name),
      company:Company(name, logoUrl, senderName, brandColor)
    `)
    .in('status', ['active', 'at_risk'])
    .not('managerId', 'is', null) as {
      data: Array<{
        id: string
        status: string
        progressPct: number
        startDate: string
        employee: { id: string; name: string }
        manager: { id: string; name: string; email: string }
        template: { name: string }
        company: { name: string; logoUrl: string | null; senderName: string | null; brandColor: string | null }
      }> | null
    }

  if (!instances?.length) return { sent: 0, managers: 0 }

  // Group by manager
  const byManager = new Map<string, typeof instances>()
  for (const inst of instances) {
    const key = inst.manager.id
    if (!byManager.has(key)) byManager.set(key, [])
    byManager.get(key)!.push(inst)
  }

  let sent = 0
  for (const [, managerInstances] of byManager) {
    const manager = managerInstances[0].manager
    const company = managerInstances[0].company

    const rows: DigestRow[] = managerInstances.map(inst => ({
      instanceId: inst.id,
      employeeName: inst.employee.name,
      templateName: inst.template.name,
      progressPct: inst.progressPct,
      status: inst.status,
      daysActive: Math.max(1, Math.floor((now.getTime() - new Date(inst.startDate).getTime()) / 86400000)),
    }))

    const activeCount = rows.length
    const subject = `Jouw team deze week — ${activeCount} actieve onboarding${activeCount !== 1 ? 's' : ''}`

    console.log(`[digest] stuur naar ${manager.email} (${activeCount} medewerkers)`)

    try {
      await resend.emails.send({
        from: 'Onvanta <hello@onvanta.io>',
        to: manager.email,
        subject,
        html: buildDigestEmail({
          managerFirstName: manager.name.split(' ')[0],
          rows,
          teamUrl: `${baseUrl}/manager`,
          branding: { ...company, companyName: company.name },
        }),
      })
      sent++
    } catch (err) {
      console.error(`[digest] email fout voor ${manager.email}:`, err)
    }
  }

  return { sent, managers: byManager.size }
}

// ─── At-risk runner ───────────────────────────────────────────────────────────

async function runAtRiskCheck(now: Date, baseUrl: string): Promise<{ notified: number; total: number }> {
  const cooldownCutoff = new Date(now.getTime() - NOTIFY_COOLDOWN_DAYS * 86400000).toISOString()

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

  if (instErr || !instances?.length) return { notified: 0, total: 0 }

  const instanceIds = instances.map(i => i.id)

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

  const { data: overdueTasks } = await supabaseAdmin
    .from('Task')
    .select('instanceId')
    .in('instanceId', instanceIds)
    .eq('status', 'overdue')

  const overdueByInstance: Record<string, number> = {}
  for (const task of overdueTasks ?? []) {
    overdueByInstance[task.instanceId] = (overdueByInstance[task.instanceId] ?? 0) + 1
  }

  let notified = 0

  for (const instance of instances) {
    const lastActivity = lastActivityByInstance[instance.id] ?? null
    const overdueCount = overdueByInstance[instance.id] ?? 0

    const daysSinceActivity = lastActivity
      ? Math.floor((now.getTime() - new Date(lastActivity).getTime()) / 86400000)
      : Math.floor((now.getTime() - new Date(instance.createdAt).getTime()) / 86400000)

    const inactiveAtRisk = daysSinceActivity >= AT_RISK_DAYS_INACTIVE
    const overdueAtRisk = overdueCount >= AT_RISK_OVERDUE_COUNT

    if (!inactiveAtRisk && !overdueAtRisk) continue
    if (instance.atRiskNotifiedAt && instance.atRiskNotifiedAt > cooldownCutoff) continue

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

    try {
      await resend.emails.send({
        from: 'Onvanta <hello@onvanta.io>',
        to: instance.manager.email,
        subject: `⚠️ ${instance.employee.name} heeft aandacht nodig`,
        html: buildAtRiskEmail({
          managerName: instance.manager.name.split(' ')[0],
          employeeName: instance.employee.name,
          reason,
          detailLine,
          instanceUrl: `${baseUrl}/manager/${instance.id}`,
        }),
      })

      await supabaseAdmin
        .from('OnboardingInstance')
        .update({ atRiskNotifiedAt: now.toISOString(), status: 'at_risk' })
        .eq('id', instance.id)

      notified++
    } catch (err) {
      console.error(`[at-risk] email fout voor ${instance.employee.name}:`, err)
    }
  }

  return { notified, total: instances.length }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Ongeautoriseerd' }, { status: 401 })
  }

  const now = new Date()
  const baseUrl = process.env.NEXTAUTH_URL ?? `https://${process.env.VERCEL_URL}`
  const isMonday = now.getUTCDay() === 1

  const [atRisk, digest] = await Promise.all([
    runAtRiskCheck(now, baseUrl),
    isMonday ? runWeeklyDigest(now, baseUrl) : Promise.resolve(null),
  ])

  console.log('[notifications] at-risk:', atRisk, '| digest:', digest ?? 'skipped (not Monday)')

  return NextResponse.json({
    atRisk,
    digest: digest ?? { skipped: true, reason: 'not Monday' },
  })
}

export async function GET(req: NextRequest) {
  return POST(req)
}
