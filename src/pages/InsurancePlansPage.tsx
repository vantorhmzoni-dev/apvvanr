import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { PlanLogo } from '@/components/PlanLogo'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { saveInsuranceSelection } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { gherPlans } from '@/data/gherPlans'
import { shamelPlans } from '@/data/shamelPlans'
import type { InsurancePlanRow } from '@/data/planTypes'
import type { InsuranceFeatureSelection, InsuranceSelectionStored } from '@/types/domain'

export default function InsurancePlansPage() {
  const { variant } = useParams<{ variant: 'comprehensive' | 'third-party' }>()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const userId = params.get('user_id') ?? localStorage.getItem('user_id') ?? ''
  const q = userId ? `?user_id=${encodeURIComponent(userId)}` : ''

  useEffect(() => {
    if (variant !== 'comprehensive' && variant !== 'third-party') {
      navigate(`/plans/third-party${q}`, { replace: true })
    }
  }, [variant, navigate, q])

  const isComprehensive = variant === 'comprehensive'
  const plans = useMemo(() => (isComprehensive ? shamelPlans : gherPlans), [isComprehensive])

  const planTitle = isComprehensive ? 'تأمين شامل' : 'تأمين ضد الغير'
  const introTitle = isComprehensive ? 'التأمين الشامل' : 'التأمين ضد الغير'
  const introSub = isComprehensive
    ? 'تغطية شاملة لسيارتك ضد الحوادث والأضرار مع مزايا إضافية'
    : 'تغطية أساسية للمسؤولية تجاه الغير بحد أقصى 10,000,000 ريال'

  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br pb-10',
        isComprehensive ? 'from-plan-shamel-surface to-plan-shamel-surface' : 'from-plan-gher-surface to-plan-gher-surface',
      )}
    >
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="mb-6 flex justify-center gap-3">
          <Link
            to={`/plans/third-party${q}`}
            className={cn(
              'rounded-full border px-5 py-2 text-sm font-bold shadow-sm transition',
              !isComprehensive
                ? 'border-plan-gher-intro-from bg-plan-gher-intro-from text-white'
                : 'border-border bg-card text-foreground hover:bg-muted',
            )}
          >
            ضد الغير
          </Link>
          <Link
            to={`/plans/comprehensive${q}`}
            className={cn(
              'rounded-full border px-5 py-2 text-sm font-bold shadow-sm transition',
              isComprehensive
                ? 'border-plan-shamel-intro-from bg-plan-shamel-intro-from text-white'
                : 'border-border bg-card text-foreground hover:bg-muted',
            )}
          >
            شامل
          </Link>
        </div>

        <div
          className={cn(
            'mb-8 rounded-2xl p-6 text-white shadow-lg',
            isComprehensive
              ? 'bg-gradient-to-br from-plan-shamel-intro-from to-plan-shamel-intro-to'
              : 'bg-gradient-to-br from-plan-gher-intro-from to-plan-gher-intro-to',
          )}
        >
          <h2 className="mb-2 text-xl font-extrabold">{introTitle}</h2>
          <p className="text-sm opacity-95">{introSub}</p>
        </div>

        <div className="space-y-5">
          {plans.map((plan) => (
            <PlanOfferCard
              key={plan.name}
              plan={plan}
              planLabel={planTitle}
              variant={isComprehensive ? 'shamel' : 'gher'}
              onBuy={(sel) => {
                saveInsuranceSelection(sel)
                navigate(`/payment${q}`)
              }}
            />
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

function PlanOfferCard({
  plan,
  planLabel,
  variant,
  onBuy,
}: {
  plan: InsurancePlanRow
  planLabel: string
  variant: 'shamel' | 'gher'
  onBuy: (data: InsuranceSelectionStored) => void
}) {
  const [checks, setChecks] = useState(() => plan.features.map((f) => !!f.fixed))

  const totalExtras = useMemo(() => {
    let t = plan.base
    plan.features.forEach((f, i) => {
      if (checks[i] && !f.fixed) t += f.add
    })
    return t
  }, [plan.base, plan.features, checks])

  const vat = Math.round(totalExtras * 0.15 * 100) / 100
  const totalWithVat = Math.round((totalExtras + vat) * 100) / 100

  const selectedFeatures: InsuranceFeatureSelection[] = []
  plan.features.forEach((f, i) => {
    if (!f.fixed && checks[i] && f.add > 0) {
      selectedFeatures.push({ label: f.label, price: f.add })
    }
  })

  const money = (v: number) => new Intl.NumberFormat('ar-SA').format(v) + ' ﷼'

  return (
    <div
      className={cn(
        'rounded-2xl border-2 border-border bg-card p-5 shadow-md transition hover:-translate-y-1 hover:shadow-lg',
        variant === 'gher' && 'border-accent/30',
      )}
    >
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <PlanLogo src={plan.logo} alt="" className="h-11 max-h-11 w-auto" />
        <div>
          <div className="text-lg font-extrabold text-foreground">{plan.name}</div>
          <div className="text-sm text-muted-foreground">{planLabel}</div>
        </div>
      </div>
      <div className="my-4 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />

      {variant === 'gher' && (
        <div className="mb-3 flex items-center justify-between text-sm font-bold">
          <span>المزايا الأساسية</span>
          <span className="text-muted-foreground">مشمول</span>
        </div>
      )}

      <div className="space-y-3">
        {plan.features.map((f, i) => (
          <label
            key={i}
            className={cn(
              'flex cursor-pointer items-start gap-3 border-b border-border/40 pb-3 text-sm last:border-0',
              f.fixed && 'cursor-default opacity-90',
            )}
          >
            <input
              type="checkbox"
              disabled={!!f.fixed}
              checked={checks[i]}
              onChange={(e) => {
                const next = [...checks]
                next[i] = e.target.checked
                setChecks(next)
              }}
              className="mt-1 h-5 w-5 accent-primary"
            />
            <span className="flex-1 leading-snug">{f.label}</span>
            {variant === 'gher' && f.add > 0 && (
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-accent">
                +{f.add}
              </span>
            )}
            {variant === 'shamel' && (
              <span className="text-sm font-bold text-primary">{f.add === 0 ? 'مشمول' : `+${f.add} ﷼`}</span>
            )}
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        <Button
          type="button"
          className="rounded-lg px-6 py-5 font-extrabold shadow-md"
          onClick={() => {
            const sel: InsuranceSelectionStored = {
              company: plan.name,
              logo: plan.logo,
              plan: planLabel,
              base: plan.base,
              price: totalExtras,
              vat,
              total: totalWithVat,
              features: selectedFeatures,
            }
            onBuy(sel)
          }}
        >
          اشترِ الآن
        </Button>
        <div
          className={cn(
            'flex items-center gap-2 text-xl font-extrabold',
            variant === 'shamel' ? 'text-primary' : 'text-plan-gher-intro-from',
          )}
        >
          {variant === 'gher' && (
            <span className="inline-block h-4 w-4 rounded-full bg-accent shadow-sm ring-1 ring-border" />
          )}
          <span>{money(totalExtras)}</span>
        </div>
      </div>
    </div>
  )
}
