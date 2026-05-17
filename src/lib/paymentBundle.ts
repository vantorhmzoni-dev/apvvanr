const KEY = 'bcare_payment_bundle'

export function savePaymentBundle(data: Record<string, string>) {
  sessionStorage.setItem(KEY, JSON.stringify(data))
}

export function loadPaymentBundle(): Record<string, string> | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return null
  }
}

export function clearPaymentBundle() {
  sessionStorage.removeItem(KEY)
}
