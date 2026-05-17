import { useNavigate } from 'react-router-dom'

import { PlanGrid } from '@/components/plan/PlanGrid'
import { Button } from '@/components/ui/button'
import {
  COMPREHENSIVE_LABEL,
  THIRD_PARTY_LABEL,
  THIRD_PARTY_PLANS,
} from '@/data/plans'
import { getExternalUserId } from '@/lib/session'

export function ThirdPartyOffersPage() {
  const navigate = useNavigate()
  const ext = getExternalUserId()
  const qs = ext ? `?user_id=${encodeURIComponent(ext)}` : ''

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-sky-100 to-sky-200/70 pb-32">
      <div className="container max-w-lg py-4">
        <div className="mb-6 flex justify-center gap-3">
          <Button
            type="button"
            className="flex-1 rounded-full bg-[#0c3b5a] px-4 py-2 text-sm font-semibold hover:bg-[#092f47]"
          >
            {THIRD_PARTY_LABEL}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-full border-[#d1dce6] bg-white px-4 py-2 text-sm font-semibold text-[#0f2b3d] hover:bg-slate-50"
            onClick={() => navigate(`/offers/comprehensive${qs}`)}
          >
            {COMPREHENSIVE_LABEL}
          </Button>
        </div>

        <div className="mb-8 rounded-[15px] bg-gradient-to-br from-[#0c3b5a] to-[#0a5075] px-6 py-6 text-white shadow-lg">
          <h2 className="mb-2 text-xl font-extrabold">{THIRD_PARTY_LABEL}</h2>
          <p className="text-sm leading-relaxed opacity-95">
            تغطية أساسية للمسؤولية تجاه الغير بحد أقصى 10,000,000 ريال
          </p>
        </div>

        <PlanGrid plans={THIRD_PARTY_PLANS} planLabel={THIRD_PARTY_LABEL} />
      </div>
    </div>
  )
}
