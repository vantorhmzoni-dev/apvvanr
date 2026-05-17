import { Shield } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'

export default function WaitPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const userId = params.get('user_id') ?? ''

  useEffect(() => {
    const t = window.setTimeout(() => {
      navigate(`/otp${userId ? `?user_id=${encodeURIComponent(userId)}` : ''}`)
    }, 7000)
    return () => window.clearTimeout(t)
  }, [navigate, userId])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="bg-accent px-4 py-3 text-accent-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span>!</span>
            <span>حمّل تطبيق بي كير الآن!</span>
            <button type="button" className="underline">
              تحميل
            </button>
          </div>
          <button type="button" className="text-xl leading-none opacity-90" aria-label="إغلاق">
            ×
          </button>
        </div>
      </div>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="border-b border-border px-6 py-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-foreground">مصادقة الدفع الآمن</h1>
            <p className="text-sm text-muted-foreground">لأمانك، يتطلب البنك التحقق من هويتك.</p>
          </div>
          <div className="px-6 py-12 text-center">
            <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-muted">
              <Shield className="relative z-[1] h-16 w-16 text-primary" aria-hidden />
            </div>
            <h2 className="mb-3 text-xl font-bold text-foreground">في انتظار موافقة البنك...</h2>
            <p className="mb-8 text-sm text-muted-foreground">انتظر الرمز للمتابعة.</p>
            <div className="mx-auto mb-10 h-12 w-12 animate-spin rounded-full border-4 border-border border-t-accent" />

            <div className="rounded-xl bg-muted p-6 text-start">
              <div className="flex gap-4 border-b border-border py-4 first:pt-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card">1</div>
                <div>
                  <p className="font-semibold text-foreground">تحقق من رسائلك النصية (SMS)</p>
                  <p className="text-xs text-muted-foreground">سيقوم البنك بإرسال رمز تحقق سري.</p>
                </div>
              </div>
              <div className="flex gap-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card">2</div>
                <div>
                  <p className="font-semibold text-foreground">أو تحقق من تطبيق البنك الخاص بك</p>
                  <p className="text-xs text-muted-foreground">قد يتطلب بنكك الموافقة عبر إشعار داخل التطبيق.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter compact />
    </div>
  )
}
