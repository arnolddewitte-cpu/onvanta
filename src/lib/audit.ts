import { supabaseAdmin } from './supabase'

export async function logAudit(
  action: string,
  userId: string | null,
  companyId: string | null,
  details?: Record<string, unknown>
) {
  try {
    await supabaseAdmin.from('AuditLog').insert({
      action,
      userId: userId ?? null,
      companyId: companyId ?? null,
      details: details ?? null,
    })
  } catch {
    // Never throw — audit logging should not break main flow
  }
}
