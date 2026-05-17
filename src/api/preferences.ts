import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { VehicleCoverageInput } from '@/schemas/vehicleCoverage'

export async function insertVehicleCoveragePreferences(params: {
  sessionId: string | null
  externalUserId: string | null
  values: VehicleCoverageInput
}): Promise<{ ok: true; id: string | null } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    console.warn('[Care] Supabase غير مهيّأ — تخطّي الحفظ')
    return { ok: true, id: null }
  }

  try {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('vehicle_coverage_preferences')
      .insert({
        session_id: params.sessionId,
        external_user_id: params.externalUserId,
        payload: params.values as unknown as Record<string, unknown>,
      })
      .select('id')
      .single()

    if (error) {
      console.error(error)
      return { ok: false, error: error.message }
    }
    return { ok: true, id: data?.id ?? null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'خطأ غير معروف'
    return { ok: false, error: msg }
  }
}
