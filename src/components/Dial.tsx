import { tracks, trackById, type TrackId } from '@/data/tracks'
import { pct } from '@/lib/utils'
import type { Scores } from '@/store/progress'

export function Dial({ scores, readiness, compact = false }: { scores: Scores; readiness: number; compact?: boolean }) {
  const r = 56
  const c = 2 * Math.PI * r
  const segments = tracks.length
  const slice = c / segments
  const gap = 6

  return (
    <div className="grid w-full min-w-0 place-items-center">
      <div className="relative grid w-full place-items-center">
        <svg viewBox="0 0 160 160" className="w-full max-w-[176px]" role="img" aria-label={`Readiness ${readiness} percent`}>
          <circle cx="80" cy="80" r={r} fill="none" stroke="#eceae2" strokeWidth={13} />
          {tracks.map((t, i) => {
            const value = pct(scores[t.id as TrackId] ?? 0, t.max)
            const len = Math.max(0, (slice * value) / 100 - gap)
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
                transform={`rotate(${(i * 360) / segments - 90} 80 80)`}
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
      </div>

      <ul className={`mt-3 w-full min-w-0 ${compact ? 'grid grid-cols-2 gap-x-3 gap-y-1' : 'grid gap-1.5'}`}>
        {tracks.map((t) => {
          const value = pct(scores[trackById(t.id).id] ?? 0, t.max)
          return (
            <li key={t.id} className="flex min-w-0 items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-[2px] border border-ink" style={{ background: t.colour }} />
              <span className="w-[46px] shrink-0 truncate font-mono text-[8px] font-bold uppercase tracking-wide text-ink-2">
                {t.short}
              </span>
              <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full border border-ink bg-[#f2f0e8]">
                <span className="block h-full transition-[width] duration-700" style={{ width: `${value}%`, background: t.colour }} />
              </span>
              <span className="w-6 shrink-0 text-right font-mono text-[8px] font-bold">{value}%</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
