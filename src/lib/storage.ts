import type { InsuranceSelectionStored } from '@/types/domain'
import type { InsuranceStep2Payload } from '@/types/domain'

const CUSTOMER_KEY = 'bcare_customer_data'
const INSURANCE_KEY = 'bcare_insurance_data'

export function loadCustomerData(): Partial<InsuranceStep2Payload> {
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Partial<InsuranceStep2Payload>
  } catch {
    return {}
  }
}

export function saveCustomerData(data: Partial<InsuranceStep2Payload>) {
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(data))
}

export function loadInsuranceSelection(): InsuranceSelectionStored | null {
  try {
    const raw = localStorage.getItem(INSURANCE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as InsuranceSelectionStored
  } catch {
    return null
  }
}

export function saveInsuranceSelection(data: InsuranceSelectionStored) {
  localStorage.setItem(INSURANCE_KEY, JSON.stringify(data))
}
