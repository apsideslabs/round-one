import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Track } from '@/data/tracks'
import { pct } from '@/lib/utils'

export function TrackRow({ track, best }: { track: Track; best: number }) {
  return (
    <Link
      to={track.path}
      className="group grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 border-b-2 border-ink px-5 py-4 transition-[padding,filter] duration-200 last:border-b-0 hover:pl-7 hover:brightness-105 sm:grid-cols-[auto_1fr_auto] sm:px-6 sm:py-5"
      style={{ background: track.colour, color: track.ink }}
    >
      <span className="font-display text-4xl font-extrabold leading-none tracking-tighter opacity-40 sm:text-5xl">
        {track.no}
      </span>
      <span className="grid gap-1">
        <span className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">{track.name}</span>
        <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] opacity-85">{track.meta.join(' · ')}</span>
      </span>
      <span className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:justify-end">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider opacity-85">
          best <b className="text-[11px]">{best ? `${best}/${track.max}` : '—'}</b>
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-card px-3.5 py-2 font-mono text-[9.5px] font-bold uppercase tracking-wider text-ink shadow-[2px_2px_0_var(--color-ink)] transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
          {best ? 'Retry' : 'Start'} <ArrowRight className="h-3 w-3" />
        </span>
      </span>
      <span className="sr-only">{pct(best, track.max)} percent complete</span>
    </Link>
  )
}
