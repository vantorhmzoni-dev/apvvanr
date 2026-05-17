import { z } from 'zod'

const purposes = ['personal', 'commercial', 'rental', 'ride_hailing', 'cargo', 'petroleum'] as const

export const vehicleStep2Schema = z
  .object({
    coverage_type: z.enum(['third_party', 'comprehensive'], {
      required_error: 'اختر نوع التغطية',
    }),
    policy_start_date: z.string().min(1, 'اختر تاريخ البداية'),
    vehicle_purpose: z.enum(purposes, { required_error: 'اختر الغرض من الاستخدام' }),
    vehicle_type: z.string().trim().min(1, 'أدخل نوع المركبة'),
    vehicle_value: z
      .string()
      .trim()
      .min(1, 'أدخل قيمة المركبة')
      .refine((v) => /^\d+(\.\d+)?$/.test(v), 'أدخل قيمة رقمية صحيحة')
      .refine((v) => Number(v) >= 5000, 'الحد الأدنى لقيمة المركبة هو 5000 ريال'),
    manufacture_year: z.string().trim().min(4, 'اختر سنة الصنع'),
    repair_location: z.enum(['agency', 'workshop'], {
      required_error: 'اختر مكان الإصلاح',
    }),
  })
  .superRefine((data, ctx) => {
    const today = new Date().toISOString().slice(0, 10)
    if (data.policy_start_date < today) {
      ctx.addIssue({
        code: 'custom',
        path: ['policy_start_date'],
        message: 'تاريخ البداية يجب أن يكون اليوم أو بعده',
      })
    }
  })

export type VehicleStep2FormValues = z.infer<typeof vehicleStep2Schema>
