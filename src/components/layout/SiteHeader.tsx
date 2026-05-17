import { Menu, User } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
  navTint?: 'default' | 'accent'
}

export function SiteHeader({ className, navTint = 'default' }: Props) {
  return (
    <div
      className={cn(
        'border-b border-border backdrop-blur-md',
        navTint === 'accent' ? 'bg-accent/95 text-primary-foreground' : 'bg-card/90',
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="rounded-full border-border bg-transparent text-xs font-semibold">
            EN
          </Button>
          <Button type="button" variant="outline" size="sm" className="rounded-full border-border bg-transparent p-2" aria-label="الملف الشخصي">
            <User className={cn('h-5 w-5', navTint === 'accent' ? 'text-white' : 'text-primary')} />
          </Button>
        </div>
        <Link to="/" className="block">
          <img src="/bcare-logo.svg" alt="bcare" width={90} height={45} className="block h-[45px] w-[90px]" />
        </Link>
        <Button type="button" variant="outline" size="sm" className="rounded-full border-border bg-transparent p-2" aria-label="القائمة">
          <Menu className={cn('h-5 w-5', navTint === 'accent' ? 'text-white' : 'text-foreground')} />
        </Button>
      </div>
    </div>
  )
}
