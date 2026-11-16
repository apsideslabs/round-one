import { useState } from 'react'

/** Square wave built from rotating circles — the Fourier series, drawn. */
export function Harmonics() {
  const [terms, setTerms] = useState(5)
  const [speed, setSpeed] = useState(1)

  const cx = 90
  const cy = 200
  let x = cx
  let y = cy
  const circles: Array<{ x: number; y: number; r: number }> = []
  const wave: Array<{ x: number; y: number }> = []

  for (let i = 0; i < terms; i++) {
    const n = 2 * i + 1
    const r = 60 * (4 / (n * Math.PI))
    circles.push({ x, y, r })
    x += r * Math.cos(n * 0.6 * speed)
    y += r * Math.sin(n * 0.6 * speed)
  }
  for (let px = 0; px < 300; px++) {
    let yy = 0
    for (let i = 0; i < terms; i++) {
      const n = 2 * i + 1
      yy += (4 / (n * Math.PI)) * 60 * Math.sin(n * (px / 300) * Math.PI * 2 * speed * 0.35)
    }
    wave.push({ x: 220 + px, y: cy - yy })
  }

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <svg viewBox="0 0 560 400" className="h-full w-full">
        <line x1="0" y1={cy} x2="560" y2={cy} stroke="rgba(18,21,26,0.2)" strokeWidth="1" />
        {circles.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="none" stroke={i === 0 ? '#ff4b26' : 'rgba(47,91,255,0.5)'} strokeWidth={i === 0 ? 2 : 1.2} />
        ))}
        <line x1={x} y1={y} x2={220} y2={y} stroke="rgba(18,21,26,0.3)" strokeWidth="1" strokeDasharray="3 4" />
        <polyline points={wave.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#0e8c6a" strokeWidth="2.5" />
        <circle cx={x} cy={y} r="4" fill="#12151a" />
      </svg>
      <div className="flex flex-wrap items-center justify-center gap-3 border-t-2 border-ink bg-paper px-3 py-2">
        <label className="flex items-center gap-1.5">
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">harmonics</span>
          <input type="range" min={1} max={12} step={1} value={terms} onChange={(e) => setTerms(Number(e.target.value))} className="w-28 accent-[#ff4b26]" />
          <span className="font-mono text-[10px] font-bold tabular-nums">{terms}</span>
        </label>
        <label className="flex items-center gap-1.5">
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">phase</span>
          <input type="range" min={0.2} max={3} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-28 accent-[#2f5bff]" />
        </label>
        <span className="chip bg-[#f4f2ea] border-line">f(t) = Σ 4/(nπ)·sin(nωt), odd n only</span>
      </div>
    </div>
  )
}
