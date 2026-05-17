import { useState } from 'react'

import { Button } from '@/components/ui/button'

export function PromoRibbon() {
  const [open, setOpen] = useState(true)
  if (!open) return null
  return (
    <div className="bg-accent text-accent-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5">
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">!</span>
          <span className="font-semibold">حمّل تطبيق بي كير الآن!</span>
          <span className="hidden opacity-90 sm:inline">واستمتع بخدمات أكثر.</span>
        </div>
        <div className="flex items-center gap-2">
          <a href="#apps" className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-accent-foreground hover:bg-white/25">
            تحميل
          </a>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 w-7 rounded-full border-white/40 bg-transparent p-0 text-accent-foreground hover:bg-white/15"
            aria-label="إغلاق"
            onClick={() => setOpen(false)}
          >
            ×
          </Button>
        </div>
      </div>
    </div>
  )
}
