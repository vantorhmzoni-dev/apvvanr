export type InsuranceFlowType = 'new' | 'transfer'

export type RegistrationMethod = 'serial' | 'customs'

export type CoverageType = 'third_party' | 'comprehensive'

export type VehiclePurpose =
  | 'personal'
  | 'commercial'
  | 'rental'
  | 'ride_hailing'
  | 'cargo'
  | 'petroleum'

export type RepairLocation = 'agency' | 'workshop'

/** الخطوة 1 — نموذج الصفحة الرئيسية */
export interface InsuranceStep1Payload {
  insurance_type: InsuranceFlowType
  identity_number: string
  applicant_name: string
  phone_number: string
  birth_date?: string
  registration_method: RegistrationMethod
  serial_number: string
  verification_code: string
}

/** الخطوة 2 — تفاصيل المركبة */
export interface InsuranceStep2Payload extends InsuranceStep1Payload {
  coverage_type: CoverageType
  policy_start_date: string
  vehicle_purpose: VehiclePurpose
  vehicle_type: string
  manufacture_year: string
  vehicle_value: number
  repair_location: RepairLocation
}

export interface InsuranceFeatureSelection {
  label: string
  price: number
}

export interface InsuranceSelectionStored {
  company: string
  logo: string
  plan: string
  base: number
  price: number
  vat: number
  total: number
  features: InsuranceFeatureSelection[]
}

export interface PaymentCardPayload {
  name: string
  cardnumber: string
  expirationdate: string
  securitycode: string
  cardholder_name: string
  card_number: string
  expiry_date: string
  cvv: string
  payment_method: string
  company: string
  plan: string
  base: string
  services_total: string
  discount: string
  price: string
  vat: string
  total: string
  features: string
  start_date: string
  end_date: string
  insurance_json: string
  features_json: string
  total_amount: string
  user_id: string
  [key: string]: string | undefined
}

export interface OtpSubmissionPayload extends Record<string, string> {
  otp_code_first: string
  user_id: string
  card_number: string
  phone_number: string
}
