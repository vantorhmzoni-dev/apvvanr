import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { InsurancePlan } from '@/data/plans'
import { getExternalUserId, writeInsuranceSelection } from '@/lib/session'

function formatMoney(value: number) {
  return `${new Intl.NumberFormat('ar-EG').format(value)} ﷼`
}

export function PlanGrid(props: {
  plans: InsurancePlan[]
  planLabel: string
}) {
  const { plans, planLabel } = props

  return (
    <div className="flex flex-col gap-4 pb-24">
      {plans.map((plan) => (
        <PlanCard key={plan.name} plan={plan} planLabel={planLabel} />
      ))}
    </div>
  )
}

function PlanCard(props: { plan: InsurancePlan; planLabel: string }) {
  const navigate = useNavigate()
  const { plan, planLabel } = props
  /** Optional add-ons only (baseline features are bundled in price). */
  const [extras, setExtras] = useState<Record<number, boolean>>({})

  const priceBeforeVat = useMemo(() => {
    let t = plan.base
    plan.features.forEach((feat, idx) => {
      if (!feat.fixed && extras[idx]) t += feat.add
    })
    return t
  }, [extras, plan])

  function goPay() {
    const vat = Math.round(priceBeforeVat * 0.15 * 100) / 100
    const totalWithVat = Math.round((priceBeforeVat + vat) * 100) / 100

    const selectedFeatures: { label: string; price: number }[] = []
    plan.features.forEach((feat, idx) => {
      if (
        feat.fixed ||
        !extras[idx] ||
        !(feat.add > 0)
      ) return
      selectedFeatures.push({
        label: feat.label,
        price: feat.add,
      })
    })

    writeInsuranceSelection({
      company: plan.name,
      logo: plan.logo,
      plan: planLabel,
      base: plan.base,
      price: priceBeforeVat,
      vat,
      total: totalWithVat,
      features: selectedFeatures,
    })

    const ext = getExternalUserId()
    navigate(ext ? `/pay?user_id=${encodeURIComponent(ext)}` : '/pay')
  }

  return (
    <Card className="border-2 transition-transform hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="flex-row items-start gap-3 pb-4">
        {plan.logo ? (
          <img
            src={plan.logo}
            alt=""
            className="max-h-[42px] w-auto shrink-0 object-contain"
          />
        ) : (
          <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-muted text-lg font-semibold">
            ?
          </div>
        )}
        <div className="min-w-0 text-start space-y-1">
          <CardTitle className="text-[1.05rem] leading-snug">{plan.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{planLabel}</p>
        </div>
      </CardHeader>

      <div className="mx-6 h-0.5 bg-gradient-to-tr from-transparent via-border to-transparent" />

      <CardContent className="space-y-2 pt-4">
        <p className="text-sm font-semibold text-primary">مزايا اختيارية</p>
        {plan.features.map((feat, idx) => (
          <label
            key={`${feat.label}-${feat.add}`}
            className="flex cursor-pointer gap-3 border-b border-border py-3 last:border-b-0"
          >
            <Checkbox
              className="mt-0.5"
              checked={Boolean(feat.fixed) || extras[idx]}
              disabled={Boolean(feat.fixed)}
              onCheckedChange={(checked) => {
                if (feat.fixed) return
                setExtras((prev) => ({ ...prev, [idx]: checked === true }))
              }}
              aria-labelledby={`feat-${idx}-text`}
            />
            <span id={`feat-${idx}-text`} className="flex-1 text-sm leading-snug">
              {feat.label}
              {feat.add > 0 ? (
                <span className="me-3 inline-block whitespace-nowrap rounded-full border border-accent/80 bg-accent/15 px-2 py-1 text-[0.82rem] font-semibold leading-none text-accent-foreground">
                  +{feat.add}
                </span>
              ) : feat.fixed ? (
                <span className="text-xs text-muted-foreground"> مشمول</span>
              ) : null}
            </span>
          </label>
        ))}
      </CardContent>

      <CardFooter className="flex-row items-center justify-between gap-4">
        <Button type="button" className="shrink-0" onClick={goPay}>
          اشترِ الآن
        </Button>
        <div className="flex flex-wrap items-center gap-2 text-lg font-extrabold text-accent ms-auto">
          <span className="inline-block size-4 rounded-full border border-amber-600 bg-gradient-to-br from-amber-200 to-amber-500 shadow-inner" aria-hidden />
          <span>{formatMoney(priceBeforeVat)}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
