export interface PlanFeature {
  label: string
  add: number
  fixed?: boolean
}

export interface InsurancePlanRow {
  name: string
  logo: string
  base: number
  features: PlanFeature[]
}
