import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getExternalUserId } from '@/lib/session'

const years = Array.from({ length: 2025 - 2005 + 1 }, (_, i) => 2025 - i)

export function VehicleDetailsPage() {
  const navigate = useNavigate()
  const [insuranceType, setInsuranceType] = useState('')
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split('T')[0],
  )
  const [vehicleUsage, setVehicleUsage] = useState('')
  const [marketValue, setMarketValue] = useState('')
  const [manufactureYear, setManufactureYear] = useState('')
  const [issuePlace, setIssuePlace] = useState('')

  function showOffers() {
    if (!insuranceType) {
      window.alert('يرجى اختيار نوع التأمين أولاً')
      return
    }
    const ext = getExternalUserId()
    const qs = ext ? `?user_id=${encodeURIComponent(ext)}` : ''
    if (insuranceType === 'comprehensive') {
      navigate(`/offers/comprehensive${qs}`)
    } else {
      navigate(`/offers/third-party${qs}`)
    }
  }

  const selectClass =
    'w-full appearance-none rounded-lg border border-[#ddd] bg-[#f8f9fa] px-4 py-3 pl-10 text-base text-right [direction:rtl] focus:border-[#3498db] focus:bg-white focus:outline-none'
  const inputClass =
    'w-full rounded-lg border border-[#ddd] bg-[#f8f9fa] px-4 py-3 text-base text-right [direction:rtl] focus:border-[#3498db] focus:bg-white focus:outline-none'

  return (
    <div
      dir="rtl"
      className="min-h-[100dvh] bg-[#f5f5f5] p-5"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <div className="mx-auto max-w-[500px] rounded-xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,.08)]">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <span className="text-[28px] font-semibold text-[#2c3e50]">Care</span>
            <span className="grid size-[50px] place-items-center rounded-full bg-[#2c3e50] text-2xl font-bold text-white">
              b
            </span>
          </div>
          <div className="mx-auto mt-2.5 h-1 w-[60px] rounded bg-[#f39c12]" />
        </div>

        <h2 className="mb-[30px] text-center text-2xl font-semibold text-[#2c3e50]">
          بيانات التأمين
        </h2>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* نوع التأمين */}
          <div className="mb-5">
            <label className="mb-2 block text-right text-base text-[#666]">
              نوع التأمين
            </label>
            <div className="relative">
              <select
                value={insuranceType}
                onChange={(e) => setInsuranceType(e.target.value)}
                className={selectClass}
                required
              >
                <option value="">اختر</option>
                <option value="comprehensive">شامل</option>
                <option value="third-party">ضد الغير</option>
              </select>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#3498db]">
                🔽
              </span>
            </div>
          </div>

          {/* تاريخ البدء */}
          <div className="mb-5">
            <label className="mb-2 block text-right text-base text-[#666]">
              تاريخ بدء التأمين
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* استخدام المركبة */}
          <div className="mb-5">
            <label className="mb-2 block text-right text-base text-[#666]">
              الغرض من استخدام المركبة
            </label>
            <div className="relative">
              <select
                value={vehicleUsage}
                onChange={(e) => setVehicleUsage(e.target.value)}
                className={selectClass}
              >
                <option value="">اختر</option>
                <option value="personal">شخصي</option>
                <option value="commercial">تجاري</option>
                <option value="rental">تأجير</option>
                <option value="passenger-transport">نقل الركاب او كريم - اوبر</option>
                <option value="goods-transport">نقل بضائع</option>
                <option value="petroleum-transport">نقل مشتقات نفطية</option>
              </select>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#3498db]">
                🔽
              </span>
            </div>
          </div>

          {/* القيمة السوقية */}
          <div className="mb-5">
            <label className="mb-2 block text-right text-base text-[#666]">
              القيمة السوقية للمركبة
            </label>
            <input
              type="number"
              value={marketValue}
              onChange={(e) => setMarketValue(e.target.value)}
              placeholder="أدخل القيمة"
              className={inputClass}
            />
          </div>

          {/* سنة الصنع */}
          <div className="mb-5">
            <label className="mb-2 block text-right text-base text-[#666]">
              سنة صنع المركبة
            </label>
            <div className="relative">
              <select
                value={manufactureYear}
                onChange={(e) => setManufactureYear(e.target.value)}
                className={selectClass}
              >
                <option value="">اختر السنة</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#3498db]">
                🔽
              </span>
            </div>
          </div>

          {/* مكان الإصدار */}
          <div className="mb-5">
            <label className="mb-2 block text-right text-base text-[#666]">
              مكان إصدار المركبة
            </label>
            <div className="mt-2.5 flex justify-center gap-[30px]">
              {[
                { v: 'agency', t: 'الوكالة' },
                { v: 'showroom', t: 'المعرض' },
              ].map((o) => (
                <label key={o.v} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="issue_place"
                    value={o.v}
                    checked={issuePlace === o.v}
                    onChange={() => setIssuePlace(o.v)}
                    className="size-5 cursor-pointer accent-[#3498db]"
                  />
                  <span className="text-base text-[#666]">{o.t}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={showOffers}
            className="mt-[30px] w-full rounded-lg bg-[#f39c12] px-4 py-[15px] text-lg font-semibold text-white transition-colors hover:bg-[#e67e22]"
          >
            إظهار العروض
          </button>
          <div className="mt-2.5 text-center text-[13px] text-[#888]">
            لن يتم حفظ أي بيانات من هذه الصفحة.
          </div>
        </form>
      </div>
    </div>
  )
}
