import { useEffect, useRef, useState } from 'react'

interface Well { x: number; y: number; pull: number }

/** Drag back from the orb, release, and use the gravity wells to curve into the target. */
export function Slingshot() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [aim, setAim] = useState<{ x: number; y: number } | null>(null)
  const [shot, setShot] = useState(0)
  const [hit, setHit] = useState(false)
  const dragFrom = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const wells: Well[] = []
    let orb = { x: 0, y: 0, vx: 0, vy: 0, live: false }
    let trail: Array<{ x: number; y: number }> = []
    let target = { x: 0, y: 0, r: 18 }

    const layout = () => {
      const rect = canvas.getBoundingClientRect()
      wells.length = 0
      wells.push({ x: rect.width * 0.52, y: rect.height * 0.3, pull: 1400 })
      wells.push({ x: rect.width * 0.66, y: rect.height * 0.74, pull: -900 })
      target = { x: rect.width * 0.86, y: rect.height * 0.46, r: 18 }
      if (!orb.live) {
        orb.x = 90
        orb.y = rect.height * 0.72
      }
    }
    layout()

    const predict = (vx: number, vy: number) => {
      const pts: Array<{ x: number; y: number }> = []
      let x = orb.x
      let y = orb.y
      let dx = vx
      let dy = vy
      for (let i = 0; i < 90; i++) {
        for (const w of wells) {
          const ax = w.x - x
          const ay = w.y - y
          const d2 = Math.max(900, ax * ax + ay * ay)
          const f = w.pull / d2
          dx += ax * f * 0.02
          dy += ay * f * 0.02
        }
        dy += 0.42
        x += dx * 0.2
        y += dy * 0.2
        pts.push({ x, y })
      }
      return pts
    }

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      if (canvas.width !== Math.floor(rect.width * dpr)) {
        canvas.width = Math.floor(rect.width * dpr)
        canvas.height = Math.floor(rect.height * dpr)
        layout()
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const w = rect.width
      const h = rect.height
      ctx.clearRect(0, 0, w, h)

      // wells: attractors glow, repellers ring
      for (const well of wells) {
        const g = ctx.createRadialGradient(well.x, well.y, 4, well.x, well.y, 120)
        const tone = well.pull > 0 ? '47,91,255' : '190,18,60'
        g.addColorStop(0, `rgba(${tone},0.32)`)
        g.addColorStop(1, `rgba(${tone},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(well.x, well.y, 120, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = `rgba(${tone},0.7)`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(well.x, well.y, 16, 0, Math.PI * 2)
        ctx.stroke()
      }

      // target
      ctx.beginPath()
      ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2)
      ctx.fillStyle = hit ? '#0e8c6a' : '#f5b01b'
      ctx.fill()
      ctx.strokeStyle = '#12151a'
      ctx.lineWidth = 2
      ctx.stroke()

      // aiming
      if (dragFrom.current && aim) {
        const dx = (orb.x - aim.x) * 0.16
        const dy = (orb.y - aim.y) * 0.16
        const path = predict(dx, dy)
        ctx.fillStyle = 'rgba(255,75,38,0.55)'
        path.forEach((p, i) => {
          if (i % 3) return
          ctx.beginPath()
          ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2)
          ctx.fill()
        })
        ctx.strokeStyle = 'rgba(255,75,38,0.6)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(orb.x, orb.y)
        ctx.lineTo(aim.x, aim.y)
        ctx.stroke()
      }

      // physics
      if (orb.live) {
        for (const well of wells) {
          const ax = well.x - orb.x
          const ay = well.y - orb.y
          const d2 = Math.max(900, ax * ax + ay * ay)
          const f = well.pull / d2
          orb.vx += ax * f * 0.02
          orb.vy += ay * f * 0.02
        }
        orb.vy += 0.42
        orb.x += orb.vx * 0.2
        orb.y += orb.vy * 0.2
        trail.push({ x: orb.x, y: orb.y })
        if (trail.length > 160) trail.shift()

        if (Math.hypot(orb.x - target.x, orb.y - target.y) < target.r + 8) {
          orb.live = false
          setHit(true)
        }
        if (orb.x > w + 60 || orb.y > h + 60 || orb.x < -60) {
          orb.live = false
        }
      }

      // trail
      trail.forEach((p, i) => {
        ctx.globalAlpha = (i / trail.length) * 0.55
        ctx.fillStyle = '#ff4b26'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1

      // orb
      ctx.beginPath()
      ctx.arc(orb.x, orb.y, 10, 0, Math.PI * 2)
      ctx.fillStyle = hit ? '#0e8c6a' : '#ff4b26'
      ctx.fill()
      ctx.strokeStyle = '#12151a'
      ctx.lineWidth = 2
      ctx.stroke()

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    const down = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const p = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      if (Math.hypot(p.x - orb.x, p.y - orb.y) < 60) {
        dragFrom.current = p
        setAim(p)
      }
    }
    const move = (e: PointerEvent) => {
      if (!dragFrom.current) return
      const rect = canvas.getBoundingClientRect()
      setAim({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
    const up = () => {
      if (!dragFrom.current || !aim) {
        dragFrom.current = null
        return
      }
      orb.vx = (orb.x - aim.x) * 0.16
      orb.vy = (orb.y - aim.y) * 0.16
      orb.live = true
      trail = []
      dragFrom.current = null
      setAim(null)
      setHit(false)
    }

    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
    }
  }, [aim, hit, shot])

  return (
    <div className="relative h-full w-full">
      <canvas ref={ref} className="h-full w-full cursor-crosshair touch-none" aria-label="Drag back from the orb and release" />
      <button
        type="button"
        onClick={() => { setShot((s) => s + 1); setHit(false); setAim(null) }}
        className="absolute right-3 top-3 rounded-lg border-2 border-ink bg-card px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]"
      >
        reset
      </button>
    </div>
  )
}
