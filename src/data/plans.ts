import comprehensiveRaw from './comprehensive.json'
import thirdPartyRaw from './third-party.json'

export type PlanFeature = {
  label: string
  add: number
  fixed?: boolean
}

export type InsurancePlan = {
  name: string
  base: number
  logo?: string
  features: PlanFeature[]
}

const PLACEHOLDER_LOGO = '/assets/insurer-placeholder.svg'

const LOGO_MAP: { match: string; file: string }[] = [
  { match: 'تكافل الراجحي', file: 'takafol.jpg' },
  { match: 'الإتحاد', file: 'aletihad.png' },
  { match: 'الاتحاد', file: 'aletihad.png' },
  { match: 'الخليجية', file: 'khalejeah.webp' },
  { match: 'ولاء', file: 'walaa.jpg' },
  { match: 'سوليدرتي', file: 'salama.webp' },
  { match: 'سلامة', file: 'salama.webp' },
  { match: 'أمانة', file: 'amana.jpg' },
  { match: 'GIG', file: 'gig.png' },
  { match: 'ليفا', file: 'liva.jpg' },
  { match: 'ميدغلف', file: 'medgulf.png' },
  { match: 'الوطنية', file: 'alwatania.png' },
  { match: 'التعاونية', file: 'tawuniya.jpg' },
  { match: 'UCA', file: 'almotahida.png' },
  { match: 'المجموعة المتحدة', file: 'almotahida.png' },
  { match: 'المتحدة للتأمين', file: 'almotahida.png' },
  { match: 'Allianz', file: 'allianz.png' },
  { match: 'أليانز', file: 'allianz.png' },
  { match: 'متكاملة', file: 'motakamela.jpg' },
  { match: 'العربي', file: 'alarabia.webp' },
  { match: 'الدرع', file: 'arabian.webp' },
  { match: 'الجزيرة', file: 'aljazira.webp' },
  { match: 'بروج', file: 'borog.png' },
]

function logoFor(name: string): string {
  for (const { match, file } of LOGO_MAP) {
    if (name.includes(match)) return `/assets/logos/${file}`
  }
  return PLACEHOLDER_LOGO
}

export const THIRD_PARTY_PLANS: InsurancePlan[] = (
  thirdPartyRaw as InsurancePlan[]
).map((p) => ({ ...p, logo: logoFor(p.name) }))

export const COMPREHENSIVE_PLANS: InsurancePlan[] = (
  comprehensiveRaw as InsurancePlan[]
).map((p) => ({ ...p, logo: logoFor(p.name) }))

export const THIRD_PARTY_LABEL = 'تأمين ضد الغير'

export const COMPREHENSIVE_LABEL = 'تأمين شامل'
