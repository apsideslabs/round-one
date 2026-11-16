export function TimerRing({ left, total }: { left: number; total: number }) {
  const r = 18
  const c = 2 * Math.PI * r
  const frac = total === 0 ? 0 : left / total
  const low = left <= 8
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90" aria-hidden>
        <circle cx="22" cy="22" r={r} fill="none" stroke="#f2f0e8" strokeWidth={6} />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={low ? '#e13b2b' : '#0e8c6a'}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          className="transition-[stroke-dashoffset] duration-300 ease-linear"
        />
      </svg>
      <span className="min-w-9 text-right font-mono text-[11px] font-bold">{left}s</span>
    </span>
  )
}
