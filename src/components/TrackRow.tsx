import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Track } from '@/data/tracks'
import { RoundGlyph } from '@/components/RoundGlyph'

export function TrackRow({ track, best }: { track: Track; best: number }) {
  return (
    <Link
      to={track.path}
      className="group block w-full border-b-2 border-ink transition-[filter] duration-200 last:border-b-0 hover:brightness-105"
      style={{ background: track.colour, color: track.ink }}
    >
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-5 px-4 py-5 transition-[padding] duration-200 group-hover:pl-6 sm:gap-8 sm:px-8 sm:py-6 lg:px-12 lg:group-hover:pl-16">
        <span className="flex shrink-0 items-center gap-2 sm:gap-4">
          <span className="font-display text-3xl font-extrabold leading-none tracking-tighter opacity-35 sm:text-4xl lg:text-5xl">
            {track.no}
          </span>
          <span style={{ color: track.ink === '#ffffff' ? '#ffffff' : '#12151a' }}>
            <RoundGlyph id={track.id} colour={track.ink === '#ffffff' ? '#ffffff' : '#12151a'} size={40} />
          </span>
        </span>

        <span className="grid min-w-0 flex-1 gap-1">
          <span className="font-display text-xl font-extrabold tracking-tight sm:text-2xl lg:text-3xl">{track.name}</span>
          <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] opacity-85">{track.meta.join(' · ')}</span>
        </span>

        <span className="hidden shrink-0 items-center gap-4 sm:flex">
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider opacity-85">
            best <b className="text-[11px]">{best ? `${best}/${track.max}` : '—'}</b>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-card px-4 py-2 font-mono text-[9.5px] font-bold uppercase tracking-wider text-ink shadow-[2px_2px_0_var(--color-ink)] transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
            {best ? 'Retry' : 'Start'} <ArrowRight className="h-3 w-3" />
          </span>
        </span>

        <ArrowRight className="h-5 w-5 shrink-0 sm:hidden" />
      </div>
    </Link>
  )
}
