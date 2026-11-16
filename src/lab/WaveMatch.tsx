import { useEffect, useRef, useState } from 'react'

const TARGET = { freq: 2.2, amp: 0.62 }

/** Two waves. Turn the dials until they lock into one line. */
export function WaveMatch() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [freq, setFreq] = useState(1.2)
  const [amp, setAmp] = useState(0.35)

  const locked = Math.abs(freq - TARGET.freq) < 0.09 && Math.abs(amp - TARGET.amp) < 0.035

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0

    const draw = (t: number) => {
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

      ctx.strokeStyle = 'rgba(18,21,26,0.10)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke()

      const wave = (frequency: number, amplitude: number, colour: string, phase: number, width: number, glow: boolean) => {
        ctx.beginPath()
        for (let x = 0; x <= w; x += 2) {
          const y = h / 2 + Math.sin((x / w) * Math.PI * 2 * frequency + t / 700 + phase) * (h / 2 - 40) * amplitude
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = colour
        ctx.lineWidth = width
        ctx.shadowBlur = glow ? 18 : 0
        ctx.shadowColor = colour
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      wave(TARGET.freq, TARGET.amp, 'rgba(47,91,255,0.55)', 0, 2, false)
      wave(freq, amp, locked ? '#0e8c6a' : '#ff4b26', 0, 3, locked)

      if (locked) {
        ctx.fillStyle = 'rgba(14,140,106,0.08)'
        ctx.fillRect(0, 0, w, h)
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [freq, amp, locked])

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <canvas ref={ref} className="h-full w-full" aria-label="Wave matcher" />
      <div className="flex flex-wrap items-center justify-center gap-6 px-4 pb-3">
        <label className="flex items-center gap-2">
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3">frequency</span>
          <input type="range" min={0.6} max={3.6} step={0.02} value={freq} onChange={(e) => setFreq(Number(e.target.value))} className="w-40 accent-[#ff4b26]" />
        </label>
        <label className="flex items-center gap-2">
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3">amplitude</span>
          <input type="range" min={0.1} max={0.95} step={0.01} value={amp} onChange={(e) => setAmp(Number(e.target.value))} className="w-40 accent-[#ff4b26]" />
        </label>
        <span className={`chip ${locked ? 'bg-c2-soft' : 'bg-[#f4f2ea] border-line'}`}>{locked ? 'locked' : 'not aligned'}</span>
      </div>
    </div>
  )
}
