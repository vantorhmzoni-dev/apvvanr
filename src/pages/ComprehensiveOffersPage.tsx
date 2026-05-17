import { useNavigate } from 'react-router-dom'

import { PlanGrid } from '@/components/plan/PlanGrid'
import { Button } from '@/components/ui/button'
import {
  COMPREHENSIVE_LABEL,
  COMPREHENSIVE_PLANS,
  THIRD_PARTY_LABEL,
} from '@/data/plans'
import { getExternalUserId } from '@/lib/session'

export function ComprehensiveOffersPage() {
  const navigate = useNavigate()
  const ext = getExternalUserId()
  const qs = ext ? `?user_id=${encodeURIComponent(ext)}` : ''

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-orange-50 to-amber-100/70 pb-32">
      <div className="container max-w-lg py-4">
        <div className="mb-6 flex justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-full border-orange-100 bg-white px-4 py-2 text-sm font-semibold text-[#0f2b3d] hover:bg-orange-50/80"
            onClick={() => navigate(`/offers/third-party${qs}`)}
          >
            {THIRD_PARTY_LABEL}
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-full bg-[#f28c38] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d8702a]"
          >
            {COMPREHENSIVE_LABEL}
          </Button>
        </div>

        <div className="mb-8 rounded-[15px] bg-gradient-to-br from-[#f28c38] to-[#e67e22] px-6 py-6 text-white shadow-lg">
          <h2 className="mb-2 text-xl font-extrabold">{COMPREHENSIVE_LABEL}</h2>
          <p className="text-sm leading-relaxed opacity-95">
            تغطية شاملة لسيارتك ضد الحوادث والأضرار مع مزايا إضافية
          </p>
        </div>

        <PlanGrid plans={COMPREHENSIVE_PLANS} planLabel={COMPREHENSIVE_LABEL} />
      </div>
    </div>
  )
}
