import { useState } from 'react'

import { cn } from '@/lib/utils'

export function PlanLogo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const url = src.startsWith('assets/') ? `/${src}` : src
  if (failed) {
    return <img src="/assets/bks/Alinma_Bank_Logo.svg" alt="" className={cn('object-contain', className)} />
  }
  return (
    <img src={url} alt={alt} className={cn('object-contain', className)} onError={() => setFailed(true)} />
  )
}
