import { z } from 'zod'

export const otpSchema = z.object({
  otp: z.string().regex(/^(\d{4}|\d{6})$/, 'الرجاء كتابة رمز التحقق بشكل صحيح'),
})

export type OtpFormValues = z.infer<typeof otpSchema>
