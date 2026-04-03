import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  // Actieve instance
  const { data: instance } = await supabaseAdmin
    .from('OnboardingInstance')
    .select('id')
    .eq('employeeId', session.id)
    .in('status', ['active', 'at_risk'])
    .order('createdAt', { ascending: false })
    .limit(1)
    .single()

  if (!instance) return NextResponse.json({ instance: null, tasks: [] })

  const { data: tasks } = await supabaseAdmin
    .from('Task')
    .select('id, title, status, dueDate, doneAt, createdAt')
    .eq('instanceId', instance.id)
    .order('dueDate', { ascending: true, nullsFirst: false })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const mapped = (tasks ?? []).map(t => {
    const due = t.dueDate ? new Date(t.dueDate) : null

    let displayStatus: 'done' | 'overdue' | 'today' | 'upcoming'
    if (t.status === 'done' || t.doneAt) {
      displayStatus = 'done'
    } else if (t.status === 'overdue' || (due && due < today)) {
      displayStatus = 'overdue'
    } else if (due && due >= today && due < tomorrow) {
      displayStatus = 'today'
    } else {
      displayStatus = 'upcoming'
    }

    let dueLabel = ''
    if (due) {
      const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000)
      if (diffDays === 0) dueLabel = 'Vandaag'
      else if (diffDays === 1) dueLabel = 'Morgen'
      else if (diffDays === -1) dueLabel = 'Gisteren'
      else if (diffDays < 0) dueLabel = `${Math.abs(diffDays)} dagen geleden`
      else dueLabel = due.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
    }

    return {
      id: t.id,
      title: t.title,
      status: displayStatus,
      dueLabel,
    }
  })

  return NextResponse.json({ instance: instance.id, tasks: mapped })
}
