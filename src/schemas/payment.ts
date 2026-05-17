import { z } from 'zod'

import {
  validateCardExpiryMmYy,
  validateCardNumberPan,
} from '@/lib/saudi-validation'

export const paymentFormSchema = z.object({
  cardholder_name: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(2, 'يرجى تعبئة الاسم')),
  card_number: z
    .string()
    .transform((s) => s.replace(/\s/g, ''))
    .pipe(
      z
        .string()
        .refine(
          (v) => validateCardNumberPan(v),
          'رقم البطاقة غير صحيح',
        ),
    ),
  expiry_mm_yy: z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z
        .string()
        .refine((v) => validateCardExpiryMmYy(v), 'تاريخ الانتهاء غير صحيح'),
    ),
  cvv: z
    .string()
    .transform((s) => s.replace(/\D/g, '').slice(0, 3))
    .pipe(z.string().regex(/^\d{3}$/, 'يرجى إدخال 3 أرقام')),
})

export type PaymentFormInput = z.infer<typeof paymentFormSchema>

export const otpSchema = z.object({
  pin_code: z
    .string()
    .transform((s) => s.trim().replace(/\D/g, '').slice(0, 6))
    .pipe(
      z.string().regex(/^\d{4}$|^\d{6}$/, 'أدخل 4 أو 6 أرقام'),
    ),
})

export type OtpInput = z.infer<typeof otpSchema>

export function cardLastFour(pan: string): string {
  const digits = pan.replace(/\D/g, '')
  return digits.slice(-4)
}
