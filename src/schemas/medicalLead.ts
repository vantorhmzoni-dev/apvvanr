import { z } from 'zod'

export const medicalLeadSchema = z.object({
  coverage_type: z.enum(['individual', 'family', 'group']),
  age: z.coerce.number().int().min(1).max(120),
  gender: z.enum(['male', 'female']),
  social_status: z.enum(['single', 'married', 'divorced', 'widowed']),
  chronic_diseases: z.enum([
    'none',
    'diabetes',
    'hypertension',
    'heart',
    'other',
  ]),
  hospital_network: z.enum(['all', 'premium', 'government']),
  monthly_income: z.enum(['low', 'medium-low', 'medium-high', 'high']),
})

export type MedicalLeadInput = z.infer<typeof medicalLeadSchema>
