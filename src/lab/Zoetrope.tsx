import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { FRAMES } from '@/data/zoetrope'

/**
 * Twelve frames of one round on a drum. Spin it and the round animates; turn the
 * strobe on and you see one frame at a time, the way a real zoetrope works.
 */
export function Zoetrope() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [speed, setSpeed] = useState(1.6)
  const [strobe, setStrobe] = useState(true)
  const [running, setRunning] = useState(true)
  const angle = useRef(0)
  const speedRef = useRef(speed)
  const strobeRef = useRef(strobe)
  const runRef = useRef(running)
  speedRef.current = speed
  strobeRef.current = strobe
  runRef.current = running
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    let raf = 0
    let last = performance.now()

    const drawFrame = (f: (typeof FRAMES)[number], cx: number, cy: number, scale: number, dim: number) => {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(scale, scale)
      ctx.globalAlpha = dim
      ctx.strokeStyle = '#12151a'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'

      // chair + body, leaning
      ctx.save()
      ctx.rotate(f.lean * 0.08)
      ctx.beginPath()
      ctx.moveTo(-26, 44); ctx.lineTo(-26, 8)
      ctx.quadraticCurveTo(-26, -8, -10, -10)
      ctx.lineTo(10, -10)
      ctx.quadraticCurveTo(26, -8, 26, 8)
      ctx.lineTo(26, 44)
      ctx.stroke()

      // head
      ctx.beginPath()
      ctx.arc(f.head * 6, -34, 17, 0, Math.PI * 2)
      ctx.stroke()

      // mouth
      if (f.mouth > 0.05) {
        ctx.beginPath()
        ctx.ellipse(f.head * 6, -28, 5, 1 + f.mouth * 5, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // raised arm
      if (f.arm > 0.05) {
        ctx.beginPath()
        ctx.moveTo(24, 6)
        ctx.quadraticCurveTo(24 + f.arm * 40, -6 - f.arm * 30, 20 + f.arm * 52, -20 - f.arm * 34)
        ctx.stroke()
      }
      ctx.restore()
      ctx.restore()
    }

    const draw = (now: number) => {
      const dt = Math.min(50, now - last) / 1000
      last = now
      if (runRef.current) angle.current += dt * speedRef.current

      const rect = cv.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      if (cv.width !== Math.floor(rect.width * dpr)) {
        cv.width = Math.floor(rect.width * dpr)
        cv.height = Math.floor(rect.height * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const w = rect.width
      const h = rect.height
      ctx.fillStyle = '#f7f5ee'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const cy = h * 0.58
      const radiusX = Math.min(w * 0.42, 460)
      const radiusY = radiusX * 0.26

      // the drum
      ctx.strokeStyle = 'rgba(18,21,26,0.16)'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.ellipse(cx, cy + 60, radiusX, radiusY, 0, 0, Math.PI * 2); ctx.stroke()
      ctx.beginPath(); ctx.ellipse(cx, cy - 60, radiusX, radiusY, 0, 0, Math.PI * 2); ctx.stroke()

      // slits
      for (let i = 0; i < 12; i++) {
        const a = angle.current + (i / 12) * Math.PI * 2
        const x = cx + Math.cos(a) * radiusX
        const yTop = cy - 60 + Math.sin(a) * radiusY
        const yBot = cy + 60 + Math.sin(a) * radiusY
        ctx.strokeStyle = 'rgba(18,21,26,0.12)'
        ctx.beginPath(); ctx.moveTo(x, yTop); ctx.lineTo(x, yBot); ctx.stroke()
      }

      // frames around the drum, back first so the front draws over
      const ordered = Array.from({ length: 12 }, (_, i) => {
        const a = angle.current + (i / 12) * Math.PI * 2
        return { i, depth: Math.sin(a), x: cx + Math.cos(a) * radiusX, y: cy + Math.sin(a) * radiusY }
      }).sort((p, q) => p.depth - q.depth)

      let frontIndex = 0
      let frontDepth = -2
      ordered.forEach(({ i, depth, x, y }) => {
        if (depth > frontDepth) { frontDepth = depth; frontIndex = i }
        const scale = 0.95 + (depth + 1) * 0.55
        const dim = 0.25 + ((depth + 1) / 2) * 0.75
        if (strobeRef.current && depth < 0.55) return // the shutter is closed on everything but the near frames
        drawFrame(FRAMES[i], x, y, scale, dim)
      })
      setFrame(frontIndex)

      // the slit you look through
      if (strobeRef.current) {
        ctx.fillStyle = 'rgba(18,21,26,0.06)'
        ctx.fillRect(0, 0, w, cy - 120)
        ctx.fillRect(0, cy + 110, w, h)
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <div className="relative">
        <canvas ref={canvas} className="h-full w-full" />
        <div className="pointer-events-none absolute left-4 top-4 max-w-[380px]">
          <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3">frame {String(frame + 1).padStart(2, '0')} of 12</p>
          <p className="font-display text-lg font-extrabold leading-tight">{FRAMES[frame].note}</p>
        </div>
        <div className="pointer-events-none absolute right-4 top-4 text-right font-mono text-[9px] uppercase tracking-wider text-ink-3">
          {strobe ? 'shutter open — one frame at a time' : 'shutter open — you see the whole drum'}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t-2 border-ink bg-paper px-3 py-2">
        <button type="button" onClick={() => setRunning((r) => !r)} className="grid h-7 w-7 place-items-center rounded-md border-2 border-ink bg-c1 text-white shadow-[2px_2px_0_var(--color-ink)]">
          {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <label className="flex items-center gap-2">
          <span className="mono-label">spin</span>
          <input type="range" min={0.2} max={6} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-36 accent-[#2f5bff]" />
          <span className="font-mono text-[10px] font-bold tabular-nums">{speed.toFixed(1)}</span>
        </label>
        <button type="button" onClick={() => setStrobe((s) => !s)}
          className={`rounded-md border-2 border-ink px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)] ${strobe ? 'bg-c3' : 'bg-card'}`}>
          strobe {strobe ? 'on' : 'off'}
        </button>
        <span className="font-mono text-[9px] uppercase tracking-wider text-ink-3">twelve frames, no video file — the drum does the work</span>
      </div>
    </div>
  )
}
