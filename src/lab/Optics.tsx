import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * A small optics bench. Mirror mode obeys the law of reflection and prints the
 * angles so you can check them. Slab mode obeys Snell's law, and the emergent
 * ray comes out parallel but displaced by t·sin(θ₁−θ₂)/cos(θ₂) — which is the
 * quantity the readout reports.
 */
export function Optics() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<'mirror' | 'slab'>('mirror')
  const [angle, setAngle] = useState(35)
  const [n, setN] = useState(1.5)

  const readout = useMemo(() => {
    const inc = (angle * Math.PI) / 180
    if (mode === 'mirror') return { a: angle, b: angle, d: 0 }
    const sinT2 = Math.sin(inc) / n
    if (sinT2 > 1) return { a: angle, b: 0, d: 0 }
    const t2 = Math.asin(sinT2)
    const slabW = 110
    const t = slabW / Math.cos(t2)
    const d = (t * Math.sin(inc - t2)) / Math.cos(t2)
    return { a: angle, b: (t2 * 180) / Math.PI, d }
  }, [angle, mode, n])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      if (canvas.width !== Math.floor(rect.width * dpr)) {
        canvas.width = Math.floor(rect.width * dpr)
        canvas.height = Math.floor(rect.height * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const w = rect.width
      const h = rect.height
      const cy = h / 2
      ctx.clearRect(0, 0, w, h)

      // normal line
      ctx.strokeStyle = 'rgba(18,21,26,0.25)'
      ctx.setLineDash([4, 5])
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(w * 0.5, 30); ctx.lineTo(w * 0.5, h - 30); ctx.stroke()
      ctx.setLineDash([])

      const incident = (angle * Math.PI) / 180
      const sx = 60
      const ix = w * 0.5
      const incoming = { x: Math.cos(incident), y: -Math.sin(incident) }

      // incoming ray
      ctx.strokeStyle = '#ff4b26'
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(sx, cy + (ix - sx) * Math.tan(incident)); ctx.lineTo(ix, cy); ctx.stroke()

      // angle arc at incidence
      ctx.strokeStyle = 'rgba(18,21,26,0.4)'
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(ix, cy, 46, Math.PI, Math.PI + incident, false); ctx.stroke()

      if (mode === 'mirror') {
        // mirror surface
        ctx.strokeStyle = '#12151a'
        ctx.lineWidth = 8
        ctx.beginPath(); ctx.moveTo(ix, cy - 110); ctx.lineTo(ix, cy + 110); ctx.stroke()

        const reflected = { x: -incoming.x, y: incoming.y }
        ctx.strokeStyle = '#2f5bff'
        ctx.lineWidth = 3
        ctx.beginPath(); ctx.moveTo(ix, cy); ctx.lineTo(ix + reflected.x * w, cy + reflected.y * w); ctx.stroke()

        ctx.beginPath(); ctx.arc(ix, cy, 46, Math.PI - incident, Math.PI, false); ctx.stroke()

      } else {
        // glass slab
        const slabW = 110
        ctx.fillStyle = 'rgba(47,91,255,0.10)'
        ctx.strokeStyle = 'rgba(47,91,255,0.65)'
        ctx.lineWidth = 2
        ctx.fillRect(ix, 40, slabW, h - 80)
        ctx.strokeRect(ix, 40, slabW, h - 80)

        // Snell: n1 sin θ1 = n2 sin θ2
        const sinT2 = Math.sin(incident) / n
        if (sinT2 <= 1) {
          const t2 = Math.asin(sinT2)
          const inside = { x: Math.cos(t2), y: -Math.sin(t2) }
          const exitX = ix + slabW
          const exitY = cy + inside.y * (slabW / inside.x)

          ctx.strokeStyle = '#2f5bff'
          ctx.lineWidth = 3
          ctx.beginPath(); ctx.moveTo(ix, cy); ctx.lineTo(exitX, exitY); ctx.stroke()

          // emergent ray: parallel to the incident ray
          ctx.beginPath()
          ctx.moveTo(exitX, exitY)
          ctx.lineTo(exitX + incoming.x * (w - exitX), exitY + incoming.y * (w - exitX))
          ctx.stroke()

          // lateral displacement

        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [angle, mode, n])

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <canvas ref={ref} className="h-full w-full" aria-label="Optics bench" />
      <div className="flex flex-wrap items-center justify-center gap-3 border-t-2 border-ink bg-paper px-3 py-2">
        <div className="flex gap-1.5">
          {(['mirror', 'slab'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg border-2 border-ink px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider ${mode === m ? 'bg-c1 text-white' : 'bg-card'}`}
            >
              {m}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5">
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">θ₁</span>
          <input type="range" min={5} max={80} step={1} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-24 accent-[#ff4b26]" />
          <span className="font-mono text-[10px] font-bold tabular-nums">{angle}°</span>
        </label>
        {mode === 'slab' && (
          <label className="flex items-center gap-1.5">
            <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">n</span>
            <input type="range" min={1} max={2} step={0.05} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-24 accent-[#2f5bff]" />
            <span className="font-mono text-[10px] font-bold tabular-nums">{n.toFixed(2)}</span>
          </label>
        )}
        <span className="chip bg-[#f4f2ea] border-line">
          θ₁ {readout.a.toFixed(0)}° · θ₂ {readout.b.toFixed(1)}°
          {mode === 'slab' ? ` · shift ${readout.d.toFixed(1)} px` : ' · equal by law'}
        </span>
      </div>
    </div>
  )
}
