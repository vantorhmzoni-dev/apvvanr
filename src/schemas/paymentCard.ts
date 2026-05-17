import { z } from 'zod'

import { luhnCheck } from '@/lib/luhn'

export const paymentCardSchema = z.object({
  cardNumber: z
    .string()
    .min(12)
    .refine((s) => luhnCheck(s.replace(/\s/g, '')), { message: 'رقم البطاقة غير صحيح' }),
  cardHolder: z.string().trim().min(3, 'الرجاء إدخال اسم صحيح (3 أحرف على الأقل)'),
  cvv: z.string().regex(/^\d{3,4}$/, 'رمز CVV غير صحيح'),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'اختر الشهر'),
  expiryYear: z.string().regex(/^\d{2}$/, 'اختر السنة'),
})

export type PaymentCardFormValues = z.infer<typeof paymentCardSchema>
