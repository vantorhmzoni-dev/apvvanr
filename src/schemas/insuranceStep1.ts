import { z } from 'zod'

import { validateSaudiID } from '@/lib/validateSaudiId'

export const insuranceStep1Schema = z
  .object({
    insuranceFlow: z.enum(['new', 'transfer']),
    registrationMethod: z.enum(['serial', 'customs']),
    identityNumber: z.string(),
    applicantName: z.string(),
    phoneNumber: z.string(),
    transferIdentityNumber: z.string(),
    transferApplicantName: z.string(),
    transferPhoneNumber: z.string(),
    birthDate: z.string().optional(),
    serialNumber: z.string().trim().min(1, 'يرجى إدخال رقم المركبة'),
    verificationCode: z.string().regex(/^\d{4}$/, 'أدخل 4 أرقام للتحقق'),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'يرجى الموافقة على الشروط والأحكام',
    }),
  })
  .superRefine((data, ctx) => {
    if (data.insuranceFlow === 'new') {
      const id = data.identityNumber.replace(/\D/g, '').slice(0, 10)
      if (id.length !== 10 || !validateSaudiID(id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['identityNumber'],
          message: 'رقم الهوية/الإقامة غير صحيح',
        })
      }
      if (!data.applicantName.trim()) {
        ctx.addIssue({ code: 'custom', path: ['applicantName'], message: 'أدخل اسم مقدم الطلب' })
      }
      const phone = data.phoneNumber.replace(/\D/g, '')
      if (!/^5\d{8}$/.test(phone)) {
        ctx.addIssue({
          code: 'custom',
          path: ['phoneNumber'],
          message: 'رقم جوال صحيح يبدأ بـ 5 ويتكون من 9 أرقام',
        })
      }
    } else {
      const id = data.transferIdentityNumber.replace(/\D/g, '').slice(0, 10)
      if (id.length !== 10 || !validateSaudiID(id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['transferIdentityNumber'],
          message: 'رقم الهوية/الإقامة غير صحيح',
        })
      }
      if (!data.transferApplicantName.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['transferApplicantName'],
          message: 'أدخل اسم مقدم الطلب',
        })
      }
      const phone = data.transferPhoneNumber.replace(/\D/g, '')
      if (!/^5\d{8}$/.test(phone)) {
        ctx.addIssue({
          code: 'custom',
          path: ['transferPhoneNumber'],
          message: 'رقم جوال صحيح يبدأ بـ 5 ويتكون من 9 أرقام',
        })
      }
      if (!data.birthDate?.trim()) {
        ctx.addIssue({ code: 'custom', path: ['birthDate'], message: 'يرجى إدخال تاريخ الميلاد' })
      }
    }
  })

export type InsuranceStep1FormValues = z.infer<typeof insuranceStep1Schema>
