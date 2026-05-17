import { useCallback, useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

type Props = {
  onCodeChange: (code: string) => void
  className?: string
}

export function CaptchaCanvas({ onCodeChange, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cbRef = useRef(onCodeChange)
  cbRef.current = onCodeChange

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return ''
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    ctx.fillStyle = '#f0f4f8'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(15, 76, 114, ${Math.random() * 0.3})`
      ctx.beginPath()
      ctx.moveTo(Math.random() * w, Math.random() * h)
      ctx.lineTo(Math.random() * w, Math.random() * h)
      ctx.stroke()
    }
    ctx.font = 'bold 28px Arial'
    ctx.fillStyle = '#0F4C72'
    ctx.textBaseline = 'middle'
    const charSpacing = w / (code.length + 1)
    for (let i = 0; i < code.length; i++) {
      const x = charSpacing * (i + 1)
      const y = h / 2 + (Math.random() - 0.5) * 10
      const rotation = (Math.random() - 0.5) * 0.3
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.fillText(code[i]!, 0, 0)
      ctx.restore()
    }
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(15, 76, 114, ${Math.random() * 0.3})`
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
    }
    cbRef.current(code)
    return code
  }, [])

  useEffect(() => {
    draw()
  }, [draw])

  return (
    <div className={cn('relative h-[51px] w-28 shrink-0', className)}>
      <canvas ref={canvasRef} id="captchaCanvas" width={112} height={51} className="h-full w-full rounded-md border border-border bg-card" />
    </div>
  )
}
