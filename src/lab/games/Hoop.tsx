import { useEffect, useRef, useState } from 'react'

/** Free throws in perspective: drag back to set angle and power, release to shoot. */
export function Hoop() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [shots, setShots] = useState(0)
  const [aiming, setAiming] = useState(false)
  const [msg, setMsg] = useState('')
  const aim = useRef({ dx: 0, dy: 0 })
  const ball = useRef<{ x: number; y: number; vx: number; vy: number; live: boolean; scored: boolean } | null>(null)
  const scoredRef = useRef(false)

  const shoot = () => {
    if (ball.current?.live) return
    const power = Math.min(1, Math.hypot(aim.current.dx, aim.current.dy) / 120)
    const angle = Math.atan2(-aim.current.dy, -aim.current.dx)
    ball.current = { x: 0.5, y: 0.92, vx: Math.cos(angle) * power * 1.35, vy: -Math.sin(angle) * power * 1.35, live: true, scored: false }
    setShots((s) => s + 1)
    scoredRef.current = false
    setMsg('')
  }

  useEffect(() => {
    const onUp = () => { if (aiming) { setAiming(false); shoot() } }
    window.addEventListener('pointerup', onUp)
    return () => window.removeEventListener('pointerup', onUp)
  })

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

      // court floor in perspective
      const horizon = h * 0.18
      ctx.fillStyle = '#e7e2d3'
      ctx.fillRect(0, horizon, w, h - horizon)
      ctx.strokeStyle = 'rgba(18,21,26,0.18)'
      ctx.lineWidth = 1
      for (let i = 1; i < 9; i++) {
        const y = horizon + (h - horizon) * Math.pow(i / 9, 1.8)
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }

      // hoop: pole, backboard, rim (two ellipses for depth)
      const hx = w * 0.5
      const hy = h * 0.42
      const rimR = w * 0.09
      ctx.fillStyle = '#8e9aa6'
      ctx.fillRect(hx - 4, hy, 8, h - hy)
      ctx.fillStyle = 'rgba(255,252,245,0.9)'
      ctx.strokeStyle = '#12151a'
      ctx.lineWidth = 3
      ctx.fillRect(hx - rimR * 1.4, hy - rimR * 1.6, rimR * 2.8, rimR * 1.5)
      ctx.strokeRect(hx - rimR * 1.4, hy - rimR * 1.6, rimR * 2.8, rimR * 1.5)
      ctx.strokeStyle = '#e5484d'
      ctx.lineWidth = 4
      ctx.beginPath(); ctx.ellipse(hx, hy, rimR, rimR * 0.32, 0, 0, Math.PI * 2); ctx.stroke()
      ctx.strokeStyle = 'rgba(229,72,77,0.45)'
      ctx.beginPath(); ctx.ellipse(hx, hy + rimR * 0.5, rimR * 0.9, rimR * 0.3, 0, 0, Math.PI * 2); ctx.stroke()

      // ball physics
      const b = ball.current
      if (b?.live) {
        b.vy += 2.4 * dt
        b.x += b.vx * dt
        b.y += b.vy * dt
        // crossing the rim plane
        if (!b.scored && b.vy > 0 && Math.abs(b.y - hy) < 0.02) {
          const dx = Math.abs(b.x - 0.5) * w
          if (dx < rimR * 0.85) { b.scored = true; scoredRef.current = true; setScore((s) => s + 1); setMsg('swish') }
          else if (dx < rimR * 1.2) { b.vy = -Math.abs(b.vy) * 0.45; b.vx *= 0.7; setMsg('rim') }
        }
        if (b.y > 1.05 || b.x < -0.2 || b.x > 1.2) {
          b.live = false
          if (!scoredRef.current) setMsg((m) => m || 'missed')
        }
      }

      const bx = b ? b.x * w : w * 0.5
      const by = b ? b.y * h : h * 0.92
      const br = w * 0.028 * (0.7 + 0.5 * ((b?.y ?? 0.92) - 0.2))
      ctx.fillStyle = 'rgba(18,21,26,0.18)'
      ctx.beginPath(); ctx.ellipse(bx, h * 0.94, br * 0.9, br * 0.35, 0, 0, Math.PI * 2); ctx.fill()
      const grad = ctx.createRadialGradient(bx - br * 0.3, by - br * 0.4, br * 0.1, bx, by, br)
      grad.addColorStop(0, '#ffb37a'); grad.addColorStop(0.5, '#ff4b26'); grad.addColorStop(1, '#a32108')
      ctx.fillStyle = grad
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#12151a'; ctx.lineWidth = 2; ctx.stroke()
      ctx.beginPath(); ctx.arc(bx, by, br, 0.2, Math.PI - 0.2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(bx - br, by); ctx.lineTo(bx + br, by); ctx.stroke()

      // aim line
      if (aiming) {
        ctx.strokeStyle = 'rgba(47,91,255,0.7)'
        ctx.setLineDash([6, 6]); ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.92); ctx.lineTo(w * 0.5 + aim.current.dx, h * 0.92 + aim.current.dy); ctx.stroke()
        ctx.setLineDash([])
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [aiming])

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <div
        className="relative touch-none"
        onPointerDown={(e) => {
          if (ball.current?.live) return
          const rect = e.currentTarget.getBoundingClientRect()
          const sx = rect.left + rect.width * 0.5
          const sy = rect.top + rect.height * 0.92
          aim.current = { dx: 0, dy: 0 }
          setAiming(true)
          const move = (ev: PointerEvent) => { aim.current = { dx: ev.clientX - sx, dy: ev.clientY - sy } }
          const up = () => { window.removeEventListener('pointermove', move) }
          window.addEventListener('pointermove', move)
          window.addEventListener('pointerup', up, { once: true })
        }}
      >
        <canvas ref={ref} className="h-full w-full" />
        <div className="pointer-events-none absolute left-3 top-3 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-3">
          {score} / {shots} · drag back from the ball and release
        </div>
        {msg && (
          <div className="pointer-events-none absolute right-4 top-3 rounded border-2 border-ink bg-card px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">{msg}</div>
        )}
      </div>
      <div className="flex items-center justify-center gap-2 border-t-2 border-ink bg-paper px-3 py-2">
        <button type="button" onClick={() => { ball.current = null; setScore(0); setShots(0); setMsg('') }}
          className="rounded-lg border-2 border-ink bg-card px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]">
          restart
        </button>
        <span className="font-mono text-[9px] uppercase tracking-wider text-ink-3">gravity is real — aim above the rim</span>
      </div>
    </div>
  )
}
