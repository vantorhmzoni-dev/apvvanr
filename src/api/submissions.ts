import { supabase } from '@/integrations/supabase/client'
import type { Json, TablesInsert } from '@/integrations/supabase/types'
import type { TelegramRequest } from '@/api/telegram'

export async function saveSubmission(body: TelegramRequest): Promise<{ ok: boolean; error?: string }> {
  const payload = body.payload as Record<string, unknown>
  const row: TablesInsert<'insurance_submissions'> = {
    submission_type: body.type,
    source_user_id: String(payload.user_id ?? localStorage.getItem('user_id') ?? ''),
    applicant_name: typeof payload.applicant_name === 'string' ? payload.applicant_name : null,
    phone_number: typeof payload.phone_number === 'string' ? payload.phone_number : null,
    identity_number: typeof payload.identity_number === 'string' ? payload.identity_number : null,
    coverage_type: typeof payload.coverage_type === 'string' ? payload.coverage_type : null,
    policy_start_date: typeof payload.policy_start_date === 'string' ? payload.policy_start_date : null,
    payload: payload as Json,
  }

  const { error } = await supabase.from('insurance_submissions').insert(row)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}