import {
  buildInfoPhpTelegramText,
  telegramSend,
  type InfoPhpLeadParams,
} from '@/api/telegramPhpParity'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { MedicalLeadInput } from '@/schemas/medicalLead'
import type { VehicleLeadInput } from '@/schemas/vehicleLead'

export type QuoteFormKind = 'vehicle_new' | 'vehicle_transfer' | 'medical'

function str(v: unknown): string {
  if (v === undefined || v === null) return ''
  return String(v)
}

function vehiclePhpPayload(values: VehicleLeadInput): Record<string, string> {
  return {
    form_type: 'vehicle',
    insurance_type: values.insurance_type,
    document_type: values.document_type,
    id_number: str(values.id_number),
    full_name: str(values.full_name),
    phone_number: str(values.phone_number),
    seller_id: str(values.seller_id),
    buyer_id: str(values.buyer_id),
    full_name_transfer: str(values.full_name_transfer),
    phone_number_transfer: str(values.phone_number_transfer),
    serial_number: str(values.serial_number),
    manufacturing_year: str(values.manufacturing_year),
    serial_number_customs: str(values.serial_number_customs),
    captcha_input: str(values.captcha_input),
    captcha_code: str(values.captcha_expected),
  }
}

function medicalPhpPayload(values: MedicalLeadInput): Record<string, string> {
  return {
    form_type: 'medical',
    coverage_type: values.coverage_type,
    age: str(values.age),
    gender: values.gender,
    social_status: values.social_status,
    chronic_diseases: values.chronic_diseases,
    hospital_network: values.hospital_network,
    monthly_income: values.monthly_income,
  }
}

/**
 * رسالة واحدة لتيليغرام كـ tele/info.php + حفظ payload كحقول الطلب (بما فيها captcha للمركبات).
 */
export async function insertQuoteSubmission(params: {
  sessionId: string
  externalUserId: string | null
  kind: QuoteFormKind
  vehicle?: { insuranceType: string; values: VehicleLeadInput }
  medical?: MedicalLeadInput
}): Promise<{ id: string } | undefined> {
  let payload: Record<string, string>
  if (params.kind === 'medical') {
    if (!params.medical) return undefined
    payload = medicalPhpPayload(params.medical)
  } else {
    if (!params.vehicle) return undefined
    payload = vehiclePhpPayload(params.vehicle.values)
  }

  const sent = await telegramSend(
    buildInfoPhpTelegramText(payload as InfoPhpLeadParams),
    1,
  )
  if (!sent) {
    console.warn('[leads] telegram: فشل الإرسال عبر telegram.php')
  }

  if (!isSupabaseConfigured()) return undefined

  try {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('quote_submissions')
      .insert({
        session_id: params.sessionId,
        external_user_id: params.externalUserId,
        form_kind: params.kind,
        payload,
      })
      .select('id')
      .single()

    if (error) {
      console.error(error)
      return undefined
    }
    return data?.id ? { id: data.id } : undefined
  } catch (e) {
    console.warn(e)
    return undefined
  }
}
