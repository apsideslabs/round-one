import { tracks, trackById, type TrackId } from '@/data/tracks'
import { pct } from '@/lib/utils'
import type { Scores } from '@/store/progress'

export function Dial({ scores, readiness }: { scores: Scores; readiness: number }) {
  const r = 56
  const c = 2 * Math.PI * r
  const quarter = c / 4
  const gap = 6

  return (
    <div className="relative grid place-items-center">
      <svg viewBox="0 0 160 160" className="w-full max-w-[190px]" role="img" aria-label={`Readiness ${readiness} percent`}>
        <circle cx="80" cy="80" r={r} fill="none" stroke="#eceae2" strokeWidth={13} />
        {tracks.map((t, i) => {
          const value = pct(scores[t.id as TrackId] ?? 0, t.max)
          const len = Math.max(0, (quarter * value) / 100 - gap)
          return (
            <circle
              key={t.id}
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke={t.colour}
              strokeWidth={13}
              strokeDasharray={`${len} ${c - len}`}
              transform={`rotate(${i * 90 - 90} 80 80)`}
              className="transition-[stroke-dasharray] duration-700"
            />
          )
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
        <span className="font-display text-4xl font-extrabold tracking-tight">
          {readiness}
          <small className="align-super text-base text-ink-3">%</small>
        </span>
        <span className="mono-label mt-1">Readiness</span>
      </div>
      <div className="mt-3 w-full space-y-1.5">
        {tracks.map((t) => {
          const value = pct(scores[trackById(t.id).id] ?? 0, t.max)
          return (
            <div key={t.id} className="grid grid-cols-[9px_58px_1fr_30px] items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-[3px] border-2 border-ink" style={{ background: t.colour }} />
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-2">{t.short}</span>
              <span className="h-2 overflow-hidden rounded-full border-2 border-ink bg-[#f2f0e8]">
                <span className="block h-full transition-[width] duration-700" style={{ width: `${value}%`, background: t.colour }} />
              </span>
              <span className="text-right font-mono text-[9px] font-bold">{value}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
