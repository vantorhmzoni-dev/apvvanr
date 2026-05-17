import { z } from 'zod'

export const vehicleCoverageSchema = z.object({
  insurance_product: z
    .string({
      required_error: 'اختر نوع التأمين',
    })
    .refine(
      (v) => v === 'comprehensive' || v === 'third-party',
      'اختر نوع التأمين',
    ),
  start_date: z.string().optional(),
  vehicle_usage: z.string().optional(),
  market_value: z.string().optional(),
  manufacture_year: z.string().optional(),
  issue_place: z.enum(['agency', 'showroom']).optional(),
})

export type VehicleCoverageInput = z.infer<typeof vehicleCoverageSchema>
