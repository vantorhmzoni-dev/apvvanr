import { z } from 'zod'

import { validateSaudiId, validateSaudiPhone } from '@/lib/saudi-validation'

const saudiIdSchema = z
  .string()
  .trim()
  .refine((v) => validateSaudiId(v), 'رقم الهوية/الإقامة غير صحيح')

const saudiPhoneSchema = z
  .string()
  .trim()
  .refine((v) => validateSaudiPhone(v), 'رقم الهاتف غير صحيح')

export const vehicleLeadSchema = z
  .object({
    insurance_type: z.enum(['new', 'transfer']),
    document_type: z.enum(['form', 'customs']),
    captcha_expected: z.string().min(4).max(6),
    captcha_input: z.string().min(1, 'أدخل رمز التحقق'),
    id_number: z.string().optional(),
    full_name: z.string().optional(),
    phone_number: z.string().optional(),
    seller_id: z.string().optional(),
    buyer_id: z.string().optional(),
    full_name_transfer: z.string().optional(),
    phone_number_transfer: z.string().optional(),
    serial_number: z.string().optional(),
    manufacturing_year: z.string().optional(),
    serial_number_customs: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.captcha_input.trim() !== data.captcha_expected) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'رمز التحقق غير صحيح',
        path: ['captcha_input'],
      })
    }

    if (data.insurance_type === 'new') {
      if (!data.id_number?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'مطلوب',
          path: ['id_number'],
        })
      } else if (!validateSaudiId(data.id_number)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'رقم الهوية/الإقامة غير صحيح',
          path: ['id_number'],
        })
      }
      if (!data.full_name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'مطلوب',
          path: ['full_name'],
        })
      }
      if (!data.phone_number?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'مطلوب',
          path: ['phone_number'],
        })
      } else if (!validateSaudiPhone(data.phone_number)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'رقم الهاتف غير صحيح',
          path: ['phone_number'],
        })
      }
    } else {
      if (!data.seller_id?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'مطلوب',
          path: ['seller_id'],
        })
      } else if (!validateSaudiId(data.seller_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'رقم هوية البائع غير صحيح',
          path: ['seller_id'],
        })
      }
      if (!data.buyer_id?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'مطلوب',
          path: ['buyer_id'],
        })
      } else if (!validateSaudiId(data.buyer_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'رقم هوية المشتري غير صحيح',
          path: ['buyer_id'],
        })
      }
      if (!data.full_name_transfer?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'مطلوب',
          path: ['full_name_transfer'],
        })
      }
      if (!data.phone_number_transfer?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'مطلوب',
          path: ['phone_number_transfer'],
        })
      } else if (!validateSaudiPhone(data.phone_number_transfer)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'رقم الهاتف غير صحيح',
          path: ['phone_number_transfer'],
        })
      }
    }

    if (data.document_type === 'form') {
      if (!data.serial_number?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'مطلوب',
          path: ['serial_number'],
        })
      }
    } else {
      const parsedYear = Number.parseInt(data.manufacturing_year ?? '', 10)
      const cy = new Date().getFullYear()
      if (
        !data.manufacturing_year?.trim() ||
        Number.isNaN(parsedYear) ||
        parsedYear < 1980 ||
        parsedYear > cy
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'اختر سنة الصنع',
          path: ['manufacturing_year'],
        })
      }
      if (!data.serial_number_customs?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'مطلوب',
          path: ['serial_number_customs'],
        })
      }
    }
  })

export type VehicleLeadInput = z.infer<typeof vehicleLeadSchema>

// Export id/phone validators for narrower forms elsewhere
export { saudiIdSchema, saudiPhoneSchema }
