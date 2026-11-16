import { useState } from 'react'

/** A 2x2 matrix applied to the unit square. Determinant is the area scale. */
export function MatrixLab() {
  const [a, setA] = useState(1)
  const [b, setB] = useState(0.6)
  const [c, setC] = useState(-0.4)
  const [d, setD] = useState(1.2)

  const det = a * d - b * c
  const apply = (x: number, y: number) => ({ x: a * x + b * y, y: c * x + d * y })

  const corners = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 }
  ].map((p) => apply(p.x, p.y))

  const toPx = (p: { x: number; y: number }) => ({ x: 240 + p.x * 110, y: 220 - p.y * 110 })
  const poly = corners.map(toPx)

  const row = (label: string, v: number, set: (n: number) => void) => (
    <label className="flex items-center gap-1.5">
      <span className="w-3 font-mono text-[9px] font-bold text-ink-3">{label}</span>
      <input type="range" min={-2} max={2} step={0.05} value={v} onChange={(e) => set(Number(e.target.value))} className="w-28 accent-[#2f5bff]" />
      <span className="w-9 font-mono text-[9px] font-bold tabular-nums">{v.toFixed(2)}</span>
    </label>
  )

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <svg viewBox="0 0 480 440" className="h-full w-full">
        <defs>
          <pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(18,21,26,0.12)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="480" height="440" fill="url(#grid)" />
        <line x1="0" y1="220" x2="480" y2="220" stroke="#12151a" strokeWidth="1.5" />
        <line x1="240" y1="0" x2="240" y2="440" stroke="#12151a" strokeWidth="1.5" />

        {/* unit square */}
        <polygon
          points={`${toPx({ x: 0, y: 0 }).x},${toPx({ x: 0, y: 0 }).y} ${toPx({ x: 1, y: 0 }).x},${toPx({ x: 1, y: 0 }).y} ${toPx({ x: 1, y: 1 }).x},${toPx({ x: 1, y: 1 }).y} ${toPx({ x: 0, y: 1 }).x},${toPx({ x: 0, y: 1 }).y}`}
          fill="none"
          stroke="rgba(18,21,26,0.35)"
          strokeDasharray="4 4"
        />

        {/* transformed */}
        <polygon
          points={poly.map((p) => `${p.x},${p.y}`).join(' ')}
          fill={det < 0 ? 'rgba(190,18,60,0.22)' : 'rgba(47,91,255,0.22)'}
          stroke={det < 0 ? '#be123c' : '#2f5bff'}
          strokeWidth="3"
        />
        {poly.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#12151a" />
        ))}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-3 border-t-2 border-ink bg-paper px-3 py-2">
        {row('a', a, setA)}
        {row('b', b, setB)}
        {row('c', c, setC)}
        {row('d', d, setD)}
        <span className={`chip ${det < 0 ? 'bg-c1-soft text-bad' : 'bg-c2-soft text-ok'}`}>
          det {det.toFixed(2)} · area ×{Math.abs(det).toFixed(2)} {det < 0 ? '· orientation flipped' : ''}
        </span>
      </div>
    </div>
  )
}
