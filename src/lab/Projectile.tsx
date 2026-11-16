import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Projectile motion, done properly: gravity 9.81 m/s^2, optional quadratic
 * drag a = -c|v|v, integrated with RK4 at a fixed 1/240 s step. Every readout
 * comes from the same integrator that flies the shot, so the numbers and the
 * arc cannot disagree.
 */
const G = 9.81
const DT = 1 / 240
const PX_PER_M = 6.2

interface State { x: number; y: number; vx: number; vy: number }

function accel(v: State, drag: number) {
  const speed = Math.hypot(v.vx, v.vy)
  return { ax: -drag * speed * v.vx, ay: -G - drag * speed * v.vy }
}

function rk4(s: State, drag: number, dt: number): State {
  const k1 = { ...s, ...accel(s, drag) }
  const s2 = { x: s.x + (dt / 2) * k1.vx, y: s.y + (dt / 2) * k1.vy, vx: s.vx + (dt / 2) * k1.ax, vy: s.vy + (dt / 2) * k1.ay }
  const k2 = { ...s2, ...accel(s2, drag) }
  const s3 = { x: s.x + (dt / 2) * k2.vx, y: s.y + (dt / 2) * k2.vy, vx: s.vx + (dt / 2) * k2.ax, vy: s.vy + (dt / 2) * k2.ay }
  const k3 = { ...s3, ...accel(s3, drag) }
  const s4 = { x: s.x + dt * k3.vx, y: s.y + dt * k3.vy, vx: s.vx + dt * k3.ax, vy: s.vy + dt * k3.ay }
  const k4 = { ...s4, ...accel(s4, drag) }

  return {
    x: s.x + (dt / 6) * (k1.vx + 2 * k2.vx + 2 * k3.vx + k4.vx),
    y: s.y + (dt / 6) * (k1.vy + 2 * k2.vy + 2 * k3.vy + k4.vy),
    vx: s.vx + (dt / 6) * (k1.ax + 2 * k2.ax + 2 * k3.ax + k4.ax),
    vy: s.vy + (dt / 6) * (k1.ay + 2 * k2.ay + 2 * k3.ay + k4.ay)
  }
}

function predict(start: State, drag: number, maxT = 12) {
  let s = { ...start }
  const pts: State[] = []
  let apex = 0
  let t = 0
  let step = 0
  while (s.y >= 0 && t < maxT) {
    s = rk4(s, drag, DT)
    t += DT
    step++
    apex = Math.max(apex, s.y)
    // sample every sixth step — keyed on the step count, not on pts.length,
    // which never reaches a multiple of six if it gates its own growth
    if (step % 6 === 0) pts.push({ ...s })
  }
  return { pts, range: s.x, apex, time: t }
}

export function Projectile() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [drag, setDrag] = useState(0)
  const [speed, setSpeed] = useState(28)
  const [angle, setAngle] = useState(45)
  const [firing, setFiring] = useState(false)

  const shot = useRef<State | null>(null)
  const trail = useRef<State[]>([])

  const start = useMemo<State>(
    () => ({
      x: 0,
      y: 0,
      vx: speed * Math.cos((angle * Math.PI) / 180),
      vy: speed * Math.sin((angle * Math.PI) / 180)
    }),
    [speed, angle]
  )
  const forecast = useMemo(() => predict(start, drag), [start, drag])

  // refs keep the animation loop off the render cycle
  const startRef = useRef(start)
  const forecastRef = useRef(forecast)
  const dragRef = useRef(drag)
  startRef.current = start
  forecastRef.current = forecast
  dragRef.current = drag

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    let acc = 0
    let last = performance.now()

    const draw = (now: number) => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      if (canvas.width !== Math.floor(rect.width * dpr)) {
        canvas.width = Math.floor(rect.width * dpr)
        canvas.height = Math.floor(rect.height * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const w = rect.width
      const h = rect.height
      const ground = h - 56
      ctx.clearRect(0, 0, w, h)

      const toPx = (x: number, y: number) => ({ px: 40 + x * PX_PER_M, py: ground - y * PX_PER_M })

      // ground + metre ticks
      ctx.strokeStyle = '#12151a'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(w, ground); ctx.stroke()
      ctx.font = '600 9px "JetBrains Mono", monospace'
      ctx.fillStyle = 'rgba(18,21,26,0.45)'
      for (let m = 0; m <= 200; m += 10) {
        const { px } = toPx(m, 0)
        if (px > w) break
        ctx.beginPath(); ctx.moveTo(px, ground); ctx.lineTo(px, ground + 6); ctx.stroke()
        if (m % 20 === 0) ctx.fillText(`${m} m`, px + 2, ground + 18)
      }

      // prediction (same integrator)
      ctx.strokeStyle = 'rgba(47,91,255,0.75)'
      ctx.lineWidth = 2.5
      ctx.setLineDash([6, 6])
      ctx.beginPath()
      forecastRef.current.pts.forEach((p, i) => {
        const { px, py } = toPx(p.x, p.y)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      })
      ctx.stroke()
      ctx.setLineDash([])

      // live shot
      if (firing && shot.current) {
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        acc += dt
        while (acc >= DT) {
          shot.current = rk4(shot.current, dragRef.current, DT)
          acc -= DT
          trail.current.push({ ...shot.current })
          if (shot.current.y < 0) {
            setFiring(false)
            shot.current.y = 0
            break
          }
        }
      } else {
        last = now
      }

      trail.current.forEach((p, i) => {
        const { px, py } = toPx(p.x, p.y)
        ctx.globalAlpha = 0.25 + (i / trail.current.length) * 0.6
        ctx.fillStyle = '#ff4b26'
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill()
      })
      ctx.globalAlpha = 1

      // cannon
      const origin = toPx(0, 0)
      ctx.save()
      ctx.translate(origin.px, origin.py)
      ctx.rotate(-(angle * Math.PI) / 180)
      ctx.fillStyle = '#12151a'
      ctx.fillRect(0, -5, 34, 10)
      ctx.restore()
      ctx.beginPath(); ctx.arc(origin.px, origin.py, 5, 0, Math.PI * 2); ctx.fillStyle = '#12151a'; ctx.fill()

      // the projectile
      const p = shot.current ?? startRef.current
      const pos = toPx(p.x, p.y)
      ctx.beginPath()
      ctx.arc(pos.px, pos.py, 7, 0, Math.PI * 2)
      ctx.fillStyle = '#ff4b26'
      ctx.fill()
      ctx.strokeStyle = '#12151a'
      ctx.lineWidth = 2
      ctx.stroke()

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [firing])

  const fire = () => {
    trail.current = []
    shot.current = { ...startRef.current }
    setFiring(true)
  }

  const stat = (label: string, value: string, unit: string) => (
    <div className="rounded-lg border-2 border-ink bg-card px-2.5 py-1.5">
      <span className="block font-mono text-[7.5px] font-bold uppercase tracking-[0.12em] text-ink-3">{label}</span>
      <span className="font-display text-sm font-extrabold tabular-nums">{value}<span className="ml-0.5 text-[9px] font-bold text-ink-3">{unit}</span></span>
    </div>
  )

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <canvas ref={ref} className="h-full w-full" aria-label="Projectile with gravity and drag" />
      <div className="flex flex-wrap items-center justify-center gap-3 border-t-2 border-ink bg-paper px-3 py-2">
        <div className="flex items-center gap-2">
          {stat('speed', speed.toFixed(0), 'm/s')}
          {stat('angle', angle.toFixed(0), '°')}
          {stat('range', forecast.range.toFixed(1), 'm')}
          {stat('apex', forecast.apex.toFixed(1), 'm')}
          {stat('flight', forecast.time.toFixed(2), 's')}
        </div>
        <label className="flex items-center gap-1.5">
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">v₀</span>
          <input type="range" min={8} max={55} step={1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-24 accent-[#ff4b26]" />
        </label>
        <label className="flex items-center gap-1.5">
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">θ</span>
          <input type="range" min={5} max={85} step={1} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-24 accent-[#ff4b26]" />
        </label>
        <label className="flex items-center gap-1.5">
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">drag</span>
          <input type="range" min={0} max={0.03} step={0.002} value={drag} onChange={(e) => setDrag(Number(e.target.value))} className="w-24 accent-[#2f5bff]" />
        </label>
        <button
          type="button"
          onClick={fire}
          className="rounded-lg border-2 border-ink bg-c1 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_var(--color-ink)]"
        >
          fire
        </button>
      </div>
    </div>
  )
}
