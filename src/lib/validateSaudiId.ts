/** التحقق من رقم الهوية/الإقامة السعودية (خوارزمية النفيق) */
export function validateSaudiID(id: string): boolean {
  const digits = id.replace(/\D/g, '')
  if (digits.length !== 10) return false
  if (!digits.startsWith('1') && !digits.startsWith('2')) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(digits[i]!, 10)
    if (i % 2 === 0) {
      digit *= 2
      if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10)
    }
    sum += digit
  }
  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === parseInt(digits[9]!, 10)
}
