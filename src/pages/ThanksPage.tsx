import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export default function ThanksPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 py-16 text-center">
      <div className="max-w-lg rounded-2xl border border-border bg-card p-10 shadow-soft">
        <h1 className="mb-4 text-2xl font-bold text-foreground">تم استلام طلبك</h1>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          شكرًا لاستخدامك بي كير. سيتم مراجعة إثبات الدفع والتواصل معك عند الحاجة.
        </p>
        <Button asChild className="font-semibold">
          <Link to="/">العودة للصفحة الرئيسية</Link>
        </Button>
      </div>
    </div>
  )
}
