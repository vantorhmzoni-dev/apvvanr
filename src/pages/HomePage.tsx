import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { CareHeader } from '@/components/layout/CareHeader'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { insertQuoteSubmission } from '@/api/leads'
import type { QuoteFormKind } from '@/api/leads'
import { getExternalUserId, getOrCreateSessionId } from '@/lib/session'
import { medicalLeadSchema, type MedicalLeadInput } from '@/schemas/medicalLead'
import {
  vehicleLeadSchema,
  type VehicleLeadInput,
} from '@/schemas/vehicleLead'

type ServiceTab = 'vehicle' | 'medical' | 'errors' | 'travel'

function randomCaptchaDigits() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function manufactureYearsDescending() {
  const y = new Date().getFullYear()
  return Array.from({ length: y - 1980 + 1 }, (_, i) => y - i)
}

const inputClass =
  'w-full rounded-lg border border-[#ddd] bg-white px-[15px] py-[15px] text-base text-right [direction:rtl] focus:border-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#2c3e50]/10'
const errorInputClass = 'border-[#e74c3c] ring-2 ring-[#e74c3c]/10'

export function HomePage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<ServiceTab>('vehicle')
  const [captchaChallenge, setCaptchaChallenge] = useState(randomCaptchaDigits)
  const [refreshSpin, setRefreshSpin] = useState(false)

  const vehicleForm = useForm<VehicleLeadInput>({
    resolver: zodResolver(vehicleLeadSchema),
    defaultValues: {
      insurance_type: 'new',
      document_type: 'form',
      captcha_expected: captchaChallenge,
      captcha_input: '',
      id_number: '',
      full_name: '',
      phone_number: '',
      seller_id: '',
      buyer_id: '',
      full_name_transfer: '',
      phone_number_transfer: '',
      serial_number: '',
      manufacturing_year: '',
      serial_number_customs: '',
    },
    mode: 'onSubmit',
  })

  useEffect(() => {
    vehicleForm.setValue('captcha_expected', captchaChallenge)
  }, [captchaChallenge, vehicleForm])

  const medicalForm = useForm<MedicalLeadInput>({
    resolver: zodResolver(medicalLeadSchema),
    defaultValues: {
      coverage_type: 'individual',
      age: 30,
      gender: 'male',
      social_status: 'single',
      chronic_diseases: 'none',
      hospital_network: 'all',
      monthly_income: 'low',
    },
  })

  const insType = vehicleForm.watch('insurance_type')
  const docType = vehicleForm.watch('document_type')

  const yearsOptions = useMemo(() => manufactureYearsDescending(), [])

  async function onVehicleSubmit(values: VehicleLeadInput) {
    const kind: QuoteFormKind =
      values.insurance_type === 'new' ? 'vehicle_new' : 'vehicle_transfer'
    const sid = getOrCreateSessionId()
    const ext = getExternalUserId()
    await insertQuoteSubmission({
      sessionId: sid,
      externalUserId: ext,
      kind,
      vehicle: { insuranceType: values.insurance_type, values },
    })
    navigate('/vehicle-details')
  }

  async function onMedicalSubmit(values: MedicalLeadInput) {
    const sid = getOrCreateSessionId()
    const ext = getExternalUserId()
    await insertQuoteSubmission({
      sessionId: sid,
      externalUserId: ext,
      kind: 'medical',
      medical: values,
    })
    navigate('/vehicle-details')
  }

  const showSoon = tab === 'errors' || tab === 'travel'

  return (
    <div className="min-h-[100dvh] bg-[#f5f5f5] text-[#333]" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <div className="mx-auto min-h-[100dvh] max-w-[400px] bg-white shadow-[0_0_20px_rgba(0,0,0,0.1)]">
        <CareHeader />

        {/* Hero */}
        <section
          className="mx-[15px] mb-5 rounded-[15px] px-5 py-[30px] text-center text-white"
          style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' }}
        >
          <h1 className="mb-2.5 text-2xl font-bold">قارن، أمِّن، أستلم وبثيقتك</h1>
          <p className="text-sm leading-[1.5] opacity-90">
            مكان واحد وقد عليك البحث بين أكثر من 20 شركة تأمين
          </p>
        </section>

        {/* Services */}
        <div className="mb-5 flex gap-2 px-[15px]">
          <ServiceChip label="مركبات" icon="🚗" active={tab === 'vehicle'} onClick={() => setTab('vehicle')} />
          <ServiceChip label="طبي" icon="🩺" active={tab === 'medical'} onClick={() => setTab('medical')} />
          <ServiceChip
            label={<>أخطاء<br />طبية</>}
            icon="⚠️"
            active={tab === 'errors'}
            onClick={() => setTab('errors')}
          />
          <ServiceChip label="سفر" icon="✈️" active={tab === 'travel'} onClick={() => setTab('travel')} />
        </div>

        {/* Insurance type tabs */}
        {tab === 'vehicle' && (
          <div className="mb-[30px] flex gap-2.5 px-[15px]">
            <TabBtn
              active={insType === 'transfer'}
              onClick={() => vehicleForm.setValue('insurance_type', 'transfer')}
            >
              نقل ملكية
            </TabBtn>
            <TabBtn
              active={insType === 'new'}
              onClick={() => vehicleForm.setValue('insurance_type', 'new')}
            >
              تأمين جديد
            </TabBtn>
          </div>
        )}

        <div className="px-[15px]">
          {tab === 'vehicle' && (
            <form onSubmit={vehicleForm.handleSubmit(onVehicleSubmit)}>
              {insType === 'new' ? (
                <>
                  <Field label="رقم الهوية / الإقامة" error={vehicleForm.formState.errors.id_number?.message}>
                    <input
                      type="text"
                      maxLength={10}
                      className={`${inputClass} ${vehicleForm.formState.errors.id_number ? errorInputClass : ''}`}
                      {...vehicleForm.register('id_number')}
                    />
                  </Field>
                  <Field label="اسم مالك الوثيقة كاملا" error={vehicleForm.formState.errors.full_name?.message}>
                    <input type="text" className={inputClass} {...vehicleForm.register('full_name')} />
                  </Field>
                  <Field label="رقم الهاتف" error={vehicleForm.formState.errors.phone_number?.message}>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="05xxxxxxxx"
                      className={`${inputClass} ${vehicleForm.formState.errors.phone_number ? errorInputClass : ''}`}
                      {...vehicleForm.register('phone_number')}
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="رقم هوية البائع" error={vehicleForm.formState.errors.seller_id?.message}>
                    <input type="text" maxLength={10} className={inputClass} {...vehicleForm.register('seller_id')} />
                  </Field>
                  <Field label="رقم هوية المشتري" error={vehicleForm.formState.errors.buyer_id?.message}>
                    <input type="text" maxLength={10} className={inputClass} {...vehicleForm.register('buyer_id')} />
                  </Field>
                  <Field label="اسم مالك الوثيقة كاملا" error={vehicleForm.formState.errors.full_name_transfer?.message}>
                    <input type="text" className={inputClass} {...vehicleForm.register('full_name_transfer')} />
                  </Field>
                  <Field label="رقم الهاتف" error={vehicleForm.formState.errors.phone_number_transfer?.message}>
                    <input type="tel" maxLength={10} placeholder="05xxxxxxxx" className={inputClass} {...vehicleForm.register('phone_number_transfer')} />
                  </Field>
                </>
              )}

              {/* Document tabs */}
              <div className="mb-5 flex gap-2.5">
                <TabBtn active={docType === 'customs'} onClick={() => vehicleForm.setValue('document_type', 'customs')}>
                  بطاقة جمركية
                </TabBtn>
                <TabBtn active={docType === 'form'} onClick={() => vehicleForm.setValue('document_type', 'form')}>
                  استمارة
                </TabBtn>
              </div>

              {docType === 'form' ? (
                <Field label="الرقم التسلسلي" error={vehicleForm.formState.errors.serial_number?.message}>
                  <input type="text" inputMode="numeric" className={inputClass} {...vehicleForm.register('serial_number')} />
                </Field>
              ) : (
                <>
                  <Field label="سنة صنع المركبة" error={vehicleForm.formState.errors.manufacturing_year?.message}>
                    <Select
                      value={vehicleForm.watch('manufacturing_year') || ''}
                      onValueChange={(v) => vehicleForm.setValue('manufacturing_year', v)}
                    >
                      <SelectTrigger className="w-full rounded-lg border-2 border-[#4a90e2] bg-white px-[15px] py-[15px] text-base text-[#666] [direction:rtl] h-auto">
                        <SelectValue placeholder="اختر سنة الصنع" />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        {yearsOptions.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="الرقم التسلسلي" error={vehicleForm.formState.errors.serial_number_customs?.message}>
                    <input type="text" inputMode="numeric" className={inputClass} {...vehicleForm.register('serial_number_customs')} />
                  </Field>
                </>
              )}

              {/* Captcha */}
              <Field label="رمز التحقق" error={vehicleForm.formState.errors.captcha_input?.message}>
                <div className="mb-5 flex items-center gap-[15px]">
                  <div className="rounded-lg border border-[#ddd] bg-[#f8f9fa] px-[15px] py-2.5 font-mono text-lg font-bold tracking-[3px] text-[#2c3e50]">
                    {captchaChallenge}
                  </div>
                  <button
                    type="button"
                    aria-label="تحديث"
                    className="cursor-pointer text-lg text-[#666] transition-transform"
                    style={{ transform: refreshSpin ? 'rotate(360deg)' : 'rotate(0deg)' }}
                    onClick={() => {
                      const next = randomCaptchaDigits()
                      setCaptchaChallenge(next)
                      vehicleForm.setValue('captcha_expected', next)
                      vehicleForm.setValue('captcha_input', '')
                      setRefreshSpin(true)
                      setTimeout(() => setRefreshSpin(false), 300)
                    }}
                  >
                    🔄
                  </button>
                </div>
                <input
                  type="text"
                  autoComplete="off"
                  className="w-full rounded-lg border border-[#ddd] px-[15px] py-3 text-center text-base"
                  {...vehicleForm.register('captcha_input')}
                />
              </Field>

              <div className="mb-5 rounded-lg bg-[#f8f9fa] p-[15px] text-xs leading-[1.4] text-[#666] text-right">
                أوافق على قيام شركة عناية الوسيط الحق في الاستعلام من شركة نجم أو أي مصدر آخر أو المعلومات الحالي عن بياناتي
              </div>

              <button
                type="submit"
                className="mb-[30px] w-full rounded-lg bg-[#ff9500] px-[15px] py-[15px] text-base font-bold text-white transition-colors hover:bg-[#e68900] active:translate-y-[1px]"
              >
                إظهار العروض
              </button>
            </form>
          )}

          {tab === 'medical' && (
            <form onSubmit={medicalForm.handleSubmit(onMedicalSubmit)}>
              <MedSelect
                label="نوع التغطية"
                value={medicalForm.watch('coverage_type')}
                onChange={(v) => medicalForm.setValue('coverage_type', v as MedicalLeadInput['coverage_type'])}
                opts={[
                  { v: 'individual', t: 'فردي' },
                  { v: 'family', t: 'عائلي' },
                  { v: 'group', t: 'جماعي' },
                ]}
              />
              <Field label="العمر" error={medicalForm.formState.errors.age?.message}>
                <input type="number" className={inputClass} {...medicalForm.register('age')} />
              </Field>
              <Field label="الجنس">
                <div className="mt-2.5 flex flex-col gap-2.5">
                  {[
                    { v: 'male', t: 'ذكر' },
                    { v: 'female', t: 'أنثى' },
                  ].map((o) => (
                    <label key={o.v} className="flex items-center gap-2.5 text-sm">
                      <input
                        type="radio"
                        value={o.v}
                        checked={medicalForm.watch('gender') === o.v}
                        onChange={() => medicalForm.setValue('gender', o.v as MedicalLeadInput['gender'])}
                        className="size-[18px] cursor-pointer accent-[#4a90e2]"
                      />
                      <span>{o.t}</span>
                    </label>
                  ))}
                </div>
              </Field>
              <MedSelect
                label="الحالة الاجتماعية"
                value={medicalForm.watch('social_status')}
                onChange={(v) => medicalForm.setValue('social_status', v as MedicalLeadInput['social_status'])}
                opts={[
                  { v: 'single', t: 'أعزب' },
                  { v: 'married', t: 'متزوج' },
                  { v: 'divorced', t: 'مطلق' },
                  { v: 'widowed', t: 'أرمل' },
                ]}
              />
              <MedSelect
                label="الأمراض المزمنة"
                value={medicalForm.watch('chronic_diseases')}
                onChange={(v) => medicalForm.setValue('chronic_diseases', v as MedicalLeadInput['chronic_diseases'])}
                opts={[
                  { v: 'none', t: 'لا يوجد' },
                  { v: 'diabetes', t: 'السكري' },
                  { v: 'hypertension', t: 'ضغط الدم' },
                  { v: 'heart', t: 'أمراض القلب' },
                  { v: 'other', t: 'أخرى' },
                ]}
              />
              <MedSelect
                label="شبكة المستشفيات المفضلة"
                value={medicalForm.watch('hospital_network')}
                onChange={(v) => medicalForm.setValue('hospital_network', v as MedicalLeadInput['hospital_network'])}
                opts={[
                  { v: 'all', t: 'جميع الشبكات' },
                  { v: 'premium', t: 'المستشفيات المميزة' },
                  { v: 'government', t: 'المستشفيات الحكومية' },
                ]}
              />
              <MedSelect
                label="الدخل الشهري"
                value={medicalForm.watch('monthly_income')}
                onChange={(v) => medicalForm.setValue('monthly_income', v as MedicalLeadInput['monthly_income'])}
                opts={[
                  { v: 'low', t: 'أقل من 5000 ريال' },
                  { v: 'medium-low', t: '5000 - 10000 ريال' },
                  { v: 'medium-high', t: '10000 - 20000 ريال' },
                  { v: 'high', t: 'أكثر من 20000 ريال' },
                ]}
              />
              <button
                type="submit"
                className="mb-[30px] w-full rounded-lg bg-[#ff9500] px-[15px] py-[15px] text-base font-bold text-white transition-colors hover:bg-[#e68900]"
              >
                إظهار العروض
              </button>
            </form>
          )}

          {showSoon && (
            <Card className="my-10 rounded-lg border-dashed py-10 text-center text-[#666]">
              <h3 className="text-lg font-semibold">قريباً</h3>
              <p className="mt-2 text-sm">هذه الخدمة ستكون متوفرة قريباً</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function ServiceChip(props: { icon: ReactNode; label: ReactNode; active: boolean; onClick: () => void }) {
  const { icon, label, active, onClick } = props
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 cursor-pointer rounded-xl border-[1.5px] px-2.5 py-[18px] text-center transition-all ${
        active ? 'border-[#2c3e50] bg-[#2c3e50] text-white' : 'border-[#e0e0e0] bg-white text-[#333]'
      }`}
    >
      <div
        className={`mx-auto mb-2 grid size-8 place-items-center rounded-full text-lg ${
          active ? 'bg-white text-[#2c3e50]' : 'bg-white'
        }`}
      >
        {icon}
      </div>
      <div className="text-xs font-medium leading-tight">{label}</div>
    </button>
  )
}

function TabBtn(props: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`flex-1 cursor-pointer rounded-lg px-5 py-3 text-center text-sm font-medium transition-all ${
        props.active ? 'bg-[#2c3e50] text-white' : 'bg-[#e0e0e0] text-[#666]'
      }`}
    >
      {props.children}
    </button>
  )
}

function Field(props: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-right text-sm text-[#333]">{props.label}</label>
      {props.children}
      {props.error ? <p className="mt-1.5 text-right text-xs text-[#e74c3c]">{props.error}</p> : null}
    </div>
  )
}

function MedSelect(props: {
  label: string
  value: string
  onChange: (v: string) => void
  opts: { v: string; t: string }[]
}) {
  return (
    <Field label={props.label}>
      <Select value={props.value} onValueChange={props.onChange}>
        <SelectTrigger className="h-auto w-full rounded-lg border-2 border-[#4a90e2] bg-white px-[15px] py-[15px] text-base text-[#666] [direction:rtl]">
          <SelectValue placeholder="اختر" />
        </SelectTrigger>
        <SelectContent dir="rtl">
          {props.opts.map((o) => (
            <SelectItem key={o.v} value={o.v}>
              {o.t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
