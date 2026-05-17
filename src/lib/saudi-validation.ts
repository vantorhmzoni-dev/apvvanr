export function validateSaudiId(id: string): boolean {
  const digits = id.replace(/\D/g, '')
  if (digits.length !== 10) return false
  if (!digits.startsWith('1') && !digits.startsWith('2')) return false
  let sum = 0
  for (let i = 0; i < 9; i++) {
    let digit = Number.parseInt(digits[i]!, 10)
    if (i % 2 === 0) {
      digit *= 2
      if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10)
    }
    sum += digit
  }
  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === Number.parseInt(digits[9]!, 10)
}

export function normalizeSaudiPhone(phone: string): string {
  let p = phone.replace(/\D/g, '')
  if (p.startsWith('966')) p = p.slice(3)
  return p
}

export function validateSaudiPhone(phone: string): boolean {
  const p = normalizeSaudiPhone(phone)
  if (p.startsWith('05') && p.length === 10) return true
  if (p.startsWith('5') && p.length === 9) return true
  return false
}

/** Luhn check for 13–19 digit PAN (demo / client-side UX only — use PSP in production). */
export function validateCardNumberPan(pan: string): boolean {
  const clean = pan.replace(/\s/g, '')
  if (!/^\d{13,19}$/.test(clean)) return false

  let sum = 0
  let alternate = false
  for (let i = clean.length - 1; i >= 0; i--) {
    let n = Number.parseInt(clean[i]!, 10)
    if (alternate) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alternate = !alternate
  }
  return sum % 10 === 0
}

export function validateCardExpiryMmYy(expiry: string): boolean {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false
  const [mm, yy] = expiry.split('/').map((n) => Number.parseInt(n, 10))
  if (mm < 1 || mm > 12) return false
  const now = new Date()
  const curY = now.getFullYear() % 100
  const curM = now.getMonth() + 1
  if (yy < curY || (yy === curY && mm < curM)) return false
  return true
}
