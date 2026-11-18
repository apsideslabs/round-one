import { useEffect, useRef, useState } from 'react'

/** A board you tilt to roll a marble past holes into the cup. */
const HOLES: Array<{ u: number; v: number; r: number }> = [
  { u: -0.42, v: -0.3, r: 0.13 }, { u: 0.36, v: 0.12, r: 0.15 },
  { u: -0.1, v: 0.52, r: 0.12 }, { u: 0.5, v: -0.55, r: 0.1 }
]
const CUP = { u: 0.62, v: 0.62, r: 0.12 }

export function Marble() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [level, setLevel] = useState(1)
  const [falls, setFalls] = useState(0)
  const [won, setWon] = useState(false)
  const ball = useRef({ u: -0.7, v: -0.7, vu: 0, vv: 0 })
  const tiltRef = useRef(tilt)
  tiltRef.current = tilt

  const reset = (nextLevel = false) => {
    ball.current = { u: -0.7, v: -0.7, vu: 0, vv: 0 }
    setWon(false)
    if (nextLevel) setLevel((l) => l + 1)
  }

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    let last = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(40, now - last) / 1000
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

      // board in perspective: a trapezoid
      const pad = 40
      const topW = w * 0.52
      const botW = w * 0.84
      const bx = (u: number, v: number) => {
        const t = (v + 1) / 2 // 0 back, 1 front
        const width = topW + (botW - topW) * t
        const cx = w / 2
        return { x: cx + u * (width / 2), y: pad + (h - pad * 2) * t, s: 0.55 + 0.45 * t }
      }

      // board surface
      const tl = bx(-1, -1), tr = bx(1, -1), br = bx(1, 1), bl = bx(-1, 1)
      ctx.fillStyle = '#e3d7ae'
      ctx.strokeStyle = '#12151a'
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(tl.x, tl.y); ctx.lineTo(tr.x, tr.y); ctx.lineTo(br.x, br.y); ctx.lineTo(bl.x, bl.y); ctx.closePath()
      ctx.fill(); ctx.stroke()

      // holes
      HOLES.forEach((hole) => {
        const p = bx(hole.u, hole.v)
        ctx.fillStyle = '#12151a'
        ctx.beginPath(); ctx.ellipse(p.x, p.y, hole.r * 150 * p.s, hole.r * 62 * p.s, 0, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2
        ctx.beginPath(); ctx.ellipse(p.x, p.y - 2, hole.r * 150 * p.s, hole.r * 62 * p.s, 0, Math.PI, 0); ctx.stroke()
      })

      // cup
      const cup = bx(CUP.u, CUP.v)
      ctx.fillStyle = '#0e8c6a'
      ctx.beginPath(); ctx.ellipse(cup.x, cup.y, CUP.r * 150 * cup.s, CUP.r * 62 * cup.s, 0, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#12151a'; ctx.lineWidth = 2; ctx.stroke()

      // physics: gravity from tilt, friction, wall bounce
      const b = ball.current
      const g = 2.6
      b.vu += tiltRef.current.x * g * dt
      b.vv += tiltRef.current.y * g * dt
      b.vu *= 0.995; b.vv *= 0.995
      b.u += b.vu * dt; b.v += b.vv * dt
      if (b.u < -0.94) { b.u = -0.94; b.vu = Math.abs(b.vu) * 0.55 }
      if (b.u > 0.94) { b.u = 0.94; b.vu = -Math.abs(b.vu) * 0.55 }
      if (b.v < -0.94) { b.v = -0.94; b.vv = Math.abs(b.vv) * 0.55 }
      if (b.v > 0.94) { b.v = 0.94; b.vv = -Math.abs(b.vv) * 0.55 }

      const hit = HOLES.find((hole) => Math.hypot(b.u - hole.u, b.v - hole.v) < hole.r * 0.85)
      if (hit && !won) { setFalls((f) => f + 1); reset() }
      if (Math.hypot(b.u - CUP.u, b.v - CUP.v) < CUP.r * 0.9 && !won) setWon(true)

      // marble + shadow
      const p = bx(b.u, b.v)
      ctx.fillStyle = 'rgba(18,21,26,0.25)'
      ctx.beginPath(); ctx.ellipse(p.x + 3, p.y + 5, 12 * p.s, 6 * p.s, 0, 0, Math.PI * 2); ctx.fill()
      const grad = ctx.createRadialGradient(p.x - 4, p.y - 6, 2, p.x, p.y, 14 * p.s)
      grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.4, '#cfd6df'); grad.addColorStop(1, '#6b7280')
      ctx.fillStyle = grad
      ctx.beginPath(); ctx.arc(p.x, p.y - 6 * p.s, 12 * p.s, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#12151a'; ctx.lineWidth = 1.5; ctx.stroke()

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [won])

  const onMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1
    setTilt({ x, y })
  }

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <div className="relative" onPointerMove={onMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
        <canvas ref={ref} className="h-full w-full touch-none" />
        <div className="pointer-events-none absolute left-3 top-3 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-3">
          level {level} · falls {falls} · move the pointer to tilt
        </div>
        {won && (
          <div className="absolute inset-0 grid place-items-center bg-paper/75">
            <div className="rounded-xl border-2 border-ink bg-card px-4 py-3 text-center shadow-[3px_3px_0_var(--color-ink)]">
              <p className="font-display text-lg font-extrabold">In the cup</p>
              <button type="button" onClick={() => reset(true)} className="mt-1.5 rounded-lg border-2 border-ink bg-c1 px-3 py-1 font-mono text-[9px] font-bold uppercase text-white shadow-[2px_2px_0_var(--color-ink)]">next board</button>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-2 border-t-2 border-ink bg-paper px-3 py-2">
        <button type="button" onClick={() => reset()} className="rounded-lg border-2 border-ink bg-card px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]">reset marble</button>
        <span className="font-mono text-[9px] uppercase tracking-wider text-ink-3">tilt is gravity — the marble keeps its momentum</span>
      </div>
    </div>
  )
}
