import { useEffect, useRef, useState } from 'react'
import { TIP_ANGLE } from '@/lib/iso'

interface Domino { x: number; angle: number; omega: number; fallen: boolean }
const COUNT = 14
const SPACING = 34
const HEIGHT = 74

/** A domino run: push one, watch the chain. Angular physics, not keyframes. */
export function Domino() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [standing, setStanding] = useState(COUNT)
  const [runs, setRuns] = useState(0)
  const pieces = useRef<Domino[]>([])
  const started = useRef(false)

  const reset = () => {
    pieces.current = Array.from({ length: COUNT }, (_, i) => ({ x: i * SPACING, angle: 0, omega: 0, fallen: false }))
    started.current = false
    setStanding(COUNT)
  }
  useEffect(() => { reset() }, [])

  const push = (index = 0) => {
    if (started.current) return
    started.current = true
    setRuns((r) => r + 1)
    const d = pieces.current[index]
    if (d) d.omega = 0.0022
  }

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    let last = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(40, now - last)
      last = now
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      if (canvas.width !== Math.floor(rect.width * dpr)) {
        canvas.width = Math.floor(rect.width * dpr)
        canvas.height = Math.floor(rect.height * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const w = rect.width
      const h = rect.height
      ctx.clearRect(0, 0, w, h)

      // floor
      const groundY = h * 0.78
      ctx.fillStyle = '#e7e2d3'
      ctx.fillRect(0, groundY, w, h - groundY)
      ctx.strokeStyle = 'rgba(18,21,26,0.16)'
      ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke()

      // physics: gravity torque on a tipping domino, and it pushes the next one
      const g = 0.0000042
      pieces.current.forEach((d, i) => {
        if (d.angle > 0 || d.omega > 0) {
          d.omega += Math.sin(d.angle + 0.15) * g * dt * 60
          d.angle += d.omega * dt
          if (d.angle >= TIP_ANGLE && !d.fallen) {
            d.fallen = true
            setStanding((s) => Math.max(0, s - 1))
            const next = pieces.current[i + 1]
            if (next && next.omega === 0) next.omega = d.omega * 0.92
          }
          if (d.angle > Math.PI / 2) { d.angle = Math.PI / 2; d.omega = 0 }
        }
      })

      // draw in isometric: each domino is a slab, rotated about its base
      const originX = w / 2 - (COUNT * SPACING) / 2
      const scale = Math.min(1, w / (COUNT * SPACING + 120))
      pieces.current.forEach((d) => {
        const bx = originX + d.x * scale
        const depth = (d.x / (COUNT * SPACING) - 0.5) * 40
        const baseY = groundY + depth * 0.3
        const ang = d.angle
        const topX = bx + Math.sin(ang) * HEIGHT * scale
        const topY = baseY - Math.cos(ang) * HEIGHT * scale
        const halfW = 13 * scale

        // side face (gives thickness)
        ctx.fillStyle = 'rgba(18,21,26,0.18)'
        ctx.beginPath()
        ctx.moveTo(bx - halfW + 6, baseY); ctx.lineTo(bx + halfW + 6, baseY)
        ctx.lineTo(topX + halfW + 6, topY); ctx.lineTo(topX - halfW + 6, topY)
        ctx.closePath(); ctx.fill()

        const grad = ctx.createLinearGradient(bx - halfW, baseY, bx + halfW, topY)
        grad.addColorStop(0, '#f7f5ee'); grad.addColorStop(1, '#cfc9b8')
        ctx.fillStyle = d.fallen ? '#d9d3c2' : grad
        ctx.strokeStyle = '#12151a'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(bx - halfW, baseY); ctx.lineTo(bx + halfW, baseY)
        ctx.lineTo(topX + halfW, topY); ctx.lineTo(topX - halfW, topY)
        ctx.closePath(); ctx.fill(); ctx.stroke()
        // pips
        ctx.fillStyle = 'rgba(18,21,26,0.55)'
        ctx.beginPath(); ctx.arc((bx + topX) / 2, (baseY + topY) / 2, 2.2 * scale, 0, Math.PI * 2); ctx.fill()
      })

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <div className="relative">
        <canvas ref={ref} className="h-full w-full" />
        <div className="pointer-events-none absolute left-3 top-3 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-3">
          {standing} standing · {runs} runs
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 border-t-2 border-ink bg-paper px-3 py-2">
        <button type="button" onClick={() => push(0)} className="rounded-lg border-2 border-ink bg-c2 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]">push the first</button>
        <button type="button" onClick={() => push(Math.floor(COUNT / 2))} className="rounded-lg border-2 border-ink bg-card px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]">push from the middle</button>
        <button type="button" onClick={reset} className="rounded-lg border-2 border-ink bg-card px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]">reset</button>
      </div>
    </div>
  )
}
