import { cn } from '@/lib/utils'

type Props = {
  className?: string
  compact?: boolean
}

export function SiteFooter({ className, compact }: Props) {
  return (
    <footer className={cn('mt-12 bg-footer py-10 text-center text-footer-muted', className)}>
      <div className="mx-auto max-w-7xl px-4">
        <div className={cn('flex flex-col items-center gap-8 lg:flex-row lg:justify-between', compact && 'gap-4')}>
          <div className="max-w-md text-center lg:text-start">
            <img src="/bcare-logo.svg" alt="BCare" className="mx-auto mb-4 w-[120px] opacity-90 lg:mx-0" />
            <p className="mb-4 text-xs leading-relaxed text-footer-muted">
              © 2026 جميع الحقوق محفوظة لشركة عناية الوسيط لوساطة التأمين. خاضعة لرقابة وإشراف البنك المركزي السعودي.
            </p>
            <div className="flex items-center justify-center gap-3 text-xs lg:justify-start">
              <span className="uppercase tracking-wide text-footer-muted">اتصل بنا</span>
              <a href="tel:8001180042" className="font-semibold text-accent">
                8001180042
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs text-footer-muted">BCare App</span>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://play.google.com/store/apps/details?id=com.app.bcare" target="_blank" rel="noreferrer">
                <img src="/android_mobile_app.svg" alt="Google Play" width={135} height={45} />
              </a>
              <a href="https://apps.apple.com/sa/app/بي-كير/id1490248033" target="_blank" rel="noreferrer">
                <img src="/ios_mobile_app.svg" alt="App Store" width={135} height={45} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
