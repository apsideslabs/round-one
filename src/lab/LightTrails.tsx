import { useEffect, useMemo, useRef, useState } from 'react'
import { monthFromStorage, totalMinutes, longestGap } from '@/data/trails'

/** A month of practice as a long exposure: light where you worked, black where you didn't. */
export function LightTrails() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [exposure, setExposure] = useState(1)
  const [hover, setHover] = useState<number | null>(null)
  const days = useMemo(() => monthFromStorage(), [])
  const total = useMemo(() => totalMinutes(days), [days])
  const gap = useMemo(() => longestGap(days), [days])

  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    let raf = 0

    const draw = () => {
      const rect = cv.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      if (cv.width !== Math.floor(rect.width * dpr)) {
        cv.width = Math.floor(rect.width * dpr)
        cv.height = Math.floor(rect.height * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const w = rect.width
      const h = rect.height

      // the dark room
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#0b0d10'
      ctx.fillRect(0, 0, w, h)
      const glow = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, Math.max(w, h) * 0.7)
      glow.addColorStop(0, 'rgba(30,34,40,0.9)')
      glow.addColorStop(1, 'rgba(8,9,11,1)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)

      // additive light: overlapping trails blow out like film
      ctx.globalCompositeOperation = 'lighter'

      const padX = w * 0.08
      const usable = w - padX * 2
      days.forEach((d, i) => {
        const x = padX + (i / (days.length - 1)) * usable
        const strength = Math.min(1, d.minutes / 60)
        if (strength <= 0) return
        const trails = 3 + Math.round(strength * 7)
        for (let k = 0; k < trails; k++) {
          const seed = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453
          const r = seed - Math.floor(seed)
          const sway = (r - 0.5) * 2
          const startY = h * 0.5 + sway * h * 0.18
          const endY = h * 0.5 + Math.sin(i * 0.7 + k) * h * 0.26
          const len = (h * 0.5) * strength * exposure * (0.5 + r * 0.8)
          const grad = ctx.createLinearGradient(x, startY, x, startY - len)
          const hue = 190 + r * 90
          grad.addColorStop(0, `hsla(${hue}, 90%, ${55 + strength * 20}%, ${0.5 * strength})`)
          grad.addColorStop(1, 'hsla(0,0%,100%,0)')
          ctx.strokeStyle = grad
          ctx.lineWidth = 0.8 + r * 1.6
          ctx.beginPath()
          ctx.moveTo(x + sway * 6, startY)
          ctx.bezierCurveTo(x + sway * 14, startY - len * 0.4, x - sway * 10, startY - len * 0.7, x + sway * 4, startY - len)
          ctx.stroke()
          void endY
        }
        // the ember at the base of each day
        const ember = ctx.createRadialGradient(x, h * 0.5, 0, x, h * 0.5, 26 + strength * 30)
        ember.addColorStop(0, `hsla(38, 100%, 62%, ${0.55 * strength})`)
        ember.addColorStop(1, 'hsla(38, 100%, 50%, 0)')
        ctx.fillStyle = ember
        ctx.beginPath(); ctx.arc(x, h * 0.5, 26 + strength * 30, 0, Math.PI * 2); ctx.fill()

        if (hover === i) {
          ctx.globalCompositeOperation = 'source-over'
          ctx.strokeStyle = 'rgba(255,252,245,0.85)'
          ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(x, h * 0.2); ctx.lineTo(x, h * 0.85); ctx.stroke()
          ctx.fillStyle = '#fffcf5'
          ctx.font = '700 11px "JetBrains Mono", monospace'
          ctx.fillText(`day ${d.day} · ${d.minutes}m`, Math.min(w - 110, x + 8), h * 0.22)
          ctx.globalCompositeOperation = 'lighter'
        }
      })

      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [days, exposure, hover])

  const onMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const padX = rect.width * 0.08
    const usable = rect.width - padX * 2
    const rel = (e.clientX - rect.left - padX) / usable
    const i = Math.round(rel * (days.length - 1))
    setHover(i >= 0 && i < days.length ? i : null)
  }

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <div className="relative" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <canvas ref={canvas} className="h-full w-full" />
        <div className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] font-bold uppercase tracking-wider text-white/60">
          thirty days · {total} minutes of practice · longest gap {gap} days
        </div>
        {hover !== null && (
          <div className="pointer-events-none absolute bottom-4 left-4 rounded border border-white/25 bg-black/50 px-2 py-1 font-mono text-[10px] text-white/80">
            {days[hover].gap ? 'no light — you did not practise' : `${days[hover].minutes} minutes · ${days[hover].rounds} rounds`}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t-2 border-ink bg-paper px-3 py-2">
        <label className="flex items-center gap-2">
          <span className="mono-label">exposure</span>
          <input type="range" min={0.3} max={2.4} step={0.05} value={exposure} onChange={(e) => setExposure(Number(e.target.value))} className="w-40 accent-[#f5b01b]" />
          <span className="font-mono text-[10px] font-bold tabular-nums">{exposure.toFixed(1)}×</span>
        </label>
        <span className="font-mono text-[9px] uppercase tracking-wider text-ink-3">longer exposure = longer trails = the same month, seen differently</span>
      </div>
    </div>
  )
}
