import { useMemo, useState } from 'react'

/** Damped harmonic oscillator: m x'' + c x' + k x = 0, integrated with RK4. */
function simulate(m: number, k: number, c: number) {
  const dt = 1 / 240
  let x = 1
  let v = 0
  const pts: Array<{ t: number; x: number }> = []
  for (let i = 0; i < 240 * 8; i++) {
    const acc = (xx: number, vv: number) => (-k * xx - c * vv) / m
    const k1x = v
    const k1v = acc(x, v)
    const k2x = v + (dt / 2) * k1v
    const k2v = acc(x + (dt / 2) * k1x, v + (dt / 2) * k1v)
    const k3x = v + (dt / 2) * k2v
    const k3v = acc(x + (dt / 2) * k2x, v + (dt / 2) * k2v)
    const k4x = v + dt * k3v
    const k4v = acc(x + dt * k3x, v + dt * k3v)
    x += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x)
    v += (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v)
    if (i % 8 === 0) pts.push({ t: i * dt, x })
  }
  return pts
}

export function Spring() {
  const [m, setM] = useState(1)
  const [k, setK] = useState(12)
  const [c, setC] = useState(1.2)

  const pts = useMemo(() => simulate(m, k, c), [m, k, c])
  const omega = Math.sqrt(k / m)
  const zeta = c / (2 * Math.sqrt(k * m))
  const regime = zeta < 0.999 ? 'under-damped' : zeta > 1.001 ? 'over-damped' : 'critically damped'

  const toPx = (t: number, x: number) => ({ px: 30 + (t / 8) * 460, py: 180 - x * 110 })
  const line = pts.map((p) => {
    const { px, py } = toPx(p.t, p.x)
    return `${px},${py}`
  })

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <svg viewBox="0 0 520 360" className="h-full w-full">
        <line x1="0" y1="180" x2="520" y2="180" stroke="rgba(18,21,26,0.25)" strokeWidth="1" />
        <polyline points={line.join(' ')} fill="none" stroke="#ff4b26" strokeWidth="2.5" />
        {/* the mass on a spring, position from the trace at t = 0 */}
        <line x1="40" y1="40" x2="40" y2="90" stroke="#12151a" strokeWidth="3" />
        <path d={`M 40 90 ${Array.from({ length: 8 }, (_, i) => `L ${i % 2 ? 26 : 54} ${100 + i * 6}`).join(' ')} L 40 148`} fill="none" stroke="#12151a" strokeWidth="2" />
        <rect x="20" y="148" width="40" height="28" fill="#2f5bff" stroke="#12151a" strokeWidth="2" />
      </svg>
      <div className="flex flex-wrap items-center justify-center gap-3 border-t-2 border-ink bg-paper px-3 py-2">
        <label className="flex items-center gap-1.5">
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">m</span>
          <input type="range" min={0.5} max={4} step={0.1} value={m} onChange={(e) => setM(Number(e.target.value))} className="w-24 accent-[#2f5bff]" />
        </label>
        <label className="flex items-center gap-1.5">
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">k</span>
          <input type="range" min={2} max={40} step={1} value={k} onChange={(e) => setK(Number(e.target.value))} className="w-24 accent-[#0e8c6a]" />
        </label>
        <label className="flex items-center gap-1.5">
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">c</span>
          <input type="range" min={0} max={12} step={0.2} value={c} onChange={(e) => setC(Number(e.target.value))} className="w-24 accent-[#ff4b26]" />
        </label>
        <span className="chip bg-[#f4f2ea] border-line">ω₀ {omega.toFixed(2)} rad/s · ζ {zeta.toFixed(2)}</span>
        <span className={`chip ${regime === 'critically damped' ? 'bg-c3-soft' : 'bg-c2-soft'}`}>{regime}</span>
      </div>
    </div>
  )
}
